
/**
 * Helper to safely extract UploadThing file key from URL or key property
 */
function getUploadThingKey(urlOrKey?: string | null): string | null {
  if (!urlOrKey) return null;
  const str = urlOrKey.trim();
  // If it is already just a key (no slashes)
  if (!str.includes("/") && !str.includes(":")) {
    return str;
  }
  // If it's a URL like https://a6ugtk0931.ufs.sh/f/<key> or https://utfs.io/f/<key>
  if (str.includes("/f/")) {
    const parts = str.split("/f/");
    if (parts[1]) {
      return parts[1].split("?")[0];
    }
  }
  return null;
}

import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { saveStoredGame } from "@/lib/CustomGamesStore";
import prisma from "@/lib/prisma";
import AdmZip from "adm-zip";
import { detectPlatform } from "@/lib/detectPlatform";

const utapi = new UTApi();

// Neo-Geo essential BIOS files required by FBNeo MVS
const NEOGEO_BIOS_FILES = ["sp-s3.sp1", "sm1.sm1", "sfix.sfix", "000-lo.lo"];
const ARCHIVE_NEOGEO_URL = "https://archive.org/download/MAME216RomsOnlyMerged/neogeo.zip";

async function fetchBufferWithHeaders(url: string, referer?: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(referer ? { "Referer": referer } : {}),
        "Accept": "*/*",
      },
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error(`Failed to fetch buffer from ${url}:`, err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    let inputUrl = "";
    let customTitle = "";
    let customSlug = "";
    let category = "arcade";
    let imageFile: File | null = null;
    let imageUrlFromPayload = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      inputUrl = (formData.get("url") as string) || (formData.get("inputUrl") as string) || "";
      customTitle = (formData.get("title") as string) || (formData.get("customTitle") as string) || "";
      customSlug = (formData.get("customSlug") as string) || "";
      category = ((formData.get("category") as string) || (formData.get("gameType") as string) || "arcade").trim().toLowerCase();

      const file = formData.get("imageFile") as File | null;
      if (file && file.size > 0) {
        imageFile = file;
      }
    } else {
      const body = await request.json();
      inputUrl = body.inputUrl;
      customTitle = body.customTitle;
      customSlug = body.customSlug || "";
      category = (body.category || body.gameType || "arcade").trim().toLowerCase();
      imageUrlFromPayload = body.imageUrl || "";
    }

    if (!inputUrl || typeof inputUrl !== "string") {
      return NextResponse.json({ error: "Please provide a valid URL" }, { status: 400 });
    }

    const trimmedUrl = inputUrl.trim();
    let resolvedDownloadUrl = "";
    let resolvedParentUrl = "";
    let romName = "";
    let extractedTitle = customTitle?.trim() || "";
    let scrapedImageUrl = "";

    // Case 1: RetroGames.cc page
    if (trimmedUrl.includes("retrogames.cc")) {
      try {
        const pageRes = await fetch(trimmedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml",
          },
        });

        if (!pageRes.ok) {
          throw new Error(`Unable to reach RetroGames page (HTTP ${pageRes.status})`);
        }

        const html = await pageRes.text();

        // Extract title
        if (!extractedTitle) {
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            extractedTitle = titleMatch[1]
              .replace(/Play Arcade/i, "")
              .replace(/Online in your browser.*/i, "")
              .replace(/- RetroGames\.cc.*/i, "")
              .trim();
          }
        }

        // Extract cover image
        const imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) ||
                         html.match(/itemprop="image"\s+src="([^"]+)"/i) ||
                         html.match(/https?:\/\/[^\s"']+\/previews\/[^\s"']+\.(?:png|jpg|webp)/i);
        if (imgMatch && imgMatch[1]) {
          scrapedImageUrl = imgMatch[1];
        } else if (imgMatch && imgMatch[0]) {
          scrapedImageUrl = imgMatch[0];
        }

        // Find embed iframe URL
        const embedMatch = html.match(/src=["'](\/\/www\.retrogames\.cc\/embed\/[^"']+)["']/i) ||
                           html.match(/src=["'](https?:\/\/www\.retrogames\.cc\/embed\/[^"']+)["']/i);

        let embedUrl = "";
        if (embedMatch && embedMatch[1]) {
          embedUrl = embedMatch[1].startsWith("//") ? "https:" + embedMatch[1] : embedMatch[1];
        } else if (trimmedUrl.includes("/embed/")) {
          embedUrl = trimmedUrl;
        }

        if (embedUrl) {
          const embedRes = await fetch(embedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer": trimmedUrl,
            },
          });

          if (embedRes.ok) {
            const embedHtml = await embedRes.text();
            const ejsMatch = embedHtml.match(/EJS_gameUrl\s*=\s*['"]([^'"]+)['"]/i);
            if (ejsMatch && ejsMatch[1]) {
              resolvedDownloadUrl = ejsMatch[1];
            }
            const parentMatch = embedHtml.match(/EJS_gameParentUrl\s*=\s*['"]([^'"]+)['"]/i);
            if (parentMatch && parentMatch[1]) {
              resolvedParentUrl = parentMatch[1];
            }
          }
        }

        // Fallback guess
        if (!resolvedDownloadUrl) {
          const urlParts = trimmedUrl.split("/");
          const lastPart = urlParts[urlParts.length - 1].replace(".html", "");
          const slugParts = lastPart.split("-");
          const shortGuess = slugParts[0].toLowerCase();
          resolvedDownloadUrl = `https://filesus3.retrogames.cc/rom/19/new/${shortGuess}.zip`;
          romName = shortGuess;
        }
      } catch (err: any) {
        console.error("Scraping retrogames page failed:", err);
      }
    } 
    // Case 2: EmulatorJS API
    else if (trimmedUrl.includes("emulatorjs.com/api/fba") || trimmedUrl.includes("?name=")) {
      const parsed = new URL(trimmedUrl);
      const nameParam = parsed.searchParams.get("name") || "";
      romName = nameParam.replace(".zip", "").toLowerCase();
      resolvedDownloadUrl = `https://filesus3.retrogames.cc/rom/19/new/${nameParam.endsWith(".zip") ? nameParam : nameParam + ".zip"}`;
    } 
    // Case 3: Direct .zip URL
    else if (trimmedUrl.endsWith(".zip")) {
      resolvedDownloadUrl = trimmedUrl;
    }

    if (!resolvedDownloadUrl) {
      return NextResponse.json({
        error: "Could not extract ROM download link from this URL."
      }, { status: 400 });
    }

    if (!romName) {
      const parts = resolvedDownloadUrl.split("/");
      romName = parts[parts.length - 1].replace(".zip", "").toLowerCase();
    }

    if (!extractedTitle) {
      extractedTitle = romName.toUpperCase();
    }

    // 1. Download primary ROM buffer
    const mainRomBuffer = await fetchBufferWithHeaders(resolvedDownloadUrl, "https://www.retrogames.cc/");
    if (!mainRomBuffer) {
      return NextResponse.json({
        error: "Failed to fetch ROM file from remote server"
      }, { status: 500 });
    }

    let finalZipBuffer = mainRomBuffer;

    // 2. Automated Dependency Resolution (Parent ROM + NeoGeo BIOS)
    let mainZip: AdmZip | null = null;
    try {
      try {
        mainZip = new AdmZip(mainRomBuffer);
      } catch (zipErr) {
        console.warn("Main ROM is not a standard zip archive:", zipErr);
      }

      if (mainZip) {
        // A) If a parent ROM is defined (e.g. clone/bootleg), merge parent + clone files
        if (resolvedParentUrl && resolvedParentUrl !== resolvedDownloadUrl) {
          console.log(`[Import] Detected parent ROM dependency: ${resolvedParentUrl}`);
          const parentBuffer = await fetchBufferWithHeaders(resolvedParentUrl, "https://www.retrogames.cc/");
          if (parentBuffer) {
            try {
              const parentZip = new AdmZip(parentBuffer);
              // Overlay clone files onto parent archive
              for (const entry of mainZip.getEntries()) {
                if (entry.isDirectory) continue;
                const existing = parentZip.getEntry(entry.entryName);
                if (existing) {
                  parentZip.deleteFile(entry.entryName);
                }
                parentZip.addFile(entry.entryName, entry.getData());
              }
              mainZip = parentZip;
              console.log("[Import] Successfully merged parent ROM and clone ROM into standalone archive.");
            } catch (pMergeErr) {
              console.error("[Import] Failed to merge parent ROM:", pMergeErr);
            }
          }
        }

        // B) Check if this is a NeoGeo game that requires neogeo BIOS files
        const entryNames: string[] = mainZip.getEntries().map((e: any) => e.entryName.toLowerCase());
        const hasNeoGeoRomPattern =
          romName.startsWith("kof") ||
          romName.startsWith("kf2k") ||
          romName.startsWith("mslug") ||
          romName.startsWith("samsho") ||
          romName.startsWith("fatfur") ||
          romName.startsWith("aof") ||
          romName.startsWith("rbff") ||
          romName.startsWith("neogeo") ||
          entryNames.some((n: string) => n.includes("-c1.") || n.includes("-s1.") || n.includes("-m1.") || n.includes("-v1."));

        const hasAnyBiosFile = entryNames.some((n: string) => NEOGEO_BIOS_FILES.includes(n));

        if (hasNeoGeoRomPattern && !hasAnyBiosFile) {
          console.log("[Import] Detected Neo-Geo game missing BIOS files. Auto-injecting neogeo BIOS...");
          const neogeoBuffer = await fetchBufferWithHeaders(ARCHIVE_NEOGEO_URL);
          if (neogeoBuffer) {
            try {
              const biosZip = new AdmZip(neogeoBuffer);
              for (const bioFile of NEOGEO_BIOS_FILES) {
                const bEntry = biosZip.getEntry(bioFile);
                if (bEntry && !mainZip.getEntry(bioFile)) {
                  mainZip.addFile(bioFile, bEntry.getData());
                }
              }
              console.log("[Import] Successfully injected NeoGeo BIOS into archive.");
            } catch (bErr) {
              console.error("[Import] Error injecting NeoGeo BIOS:", bErr);
            }
          }
        }

        finalZipBuffer = mainZip.toBuffer();
      }
    } catch (depErr) {
      console.error("[Import] Error during dependency resolution:", depErr);
      finalZipBuffer = mainRomBuffer;
    }

    const sizeMb = (finalZipBuffer.length / (1024 * 1024)).toFixed(1);
    const fileName = `${romName}.zip`;

    // 3. Upload Standalone Complete ROM to UploadThing
    const romFile = new File([new Uint8Array(finalZipBuffer)], fileName, { type: "application/zip" });
    const uploadRomRes = await utapi.uploadFiles([romFile]);

    if (!uploadRomRes[0]?.data?.ufsUrl && !uploadRomRes[0]?.data?.url) {
      const errMsg = uploadRomRes[0]?.error?.message || "Failed to upload ROM to UploadThing storage";
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const uploadedRomData = uploadRomRes[0].data;
    const finalRomUrl = uploadedRomData.ufsUrl || uploadedRomData.url;
    const finalRomKey = uploadedRomData.key;

    // 4. Handle Cover Image (Uploaded file > Manual URL > Scraped URL)
    let finalImageUrl: string | undefined = imageUrlFromPayload || undefined;
    let finalImageKey: string | undefined = undefined;

    if (imageFile) {
      try {
        const uploadImgRes = await utapi.uploadFiles([imageFile]);
        if (uploadImgRes[0]?.data?.ufsUrl || uploadImgRes[0]?.data?.url) {
          finalImageUrl = uploadImgRes[0].data.ufsUrl || uploadImgRes[0].data.url;
          finalImageKey = uploadImgRes[0].data.key;
        }
      } catch (imgErr) {
        console.error("Image upload to UploadThing failed:", imgErr);
      }
    } else if (!finalImageUrl && scrapedImageUrl) {
      try {
        console.log(`[Import] Auto-fetching scraped cover image: ${scrapedImageUrl}`);
        const imgBuffer = await fetchBufferWithHeaders(scrapedImageUrl, "https://www.retrogames.cc/");
        if (imgBuffer && imgBuffer.length > 0) {
          const imgExt = scrapedImageUrl.endsWith(".jpg") ? "jpg" : scrapedImageUrl.endsWith(".webp") ? "webp" : "png";
          const imgFileObj = new File([new Uint8Array(imgBuffer)], `${romName}_cover.${imgExt}`, { type: `image/${imgExt}` });
          const uploadImgRes = await utapi.uploadFiles([imgFileObj]);
          if (uploadImgRes[0]?.data?.ufsUrl || uploadImgRes[0]?.data?.url) {
            finalImageUrl = uploadImgRes[0].data.ufsUrl || uploadImgRes[0].data.url;
            finalImageKey = uploadImgRes[0].data.key;
            console.log("[Import] Successfully uploaded scraped cover image to UploadThing.");
          }
        }
      } catch (scrapeImgErr) {
        console.error("[Import] Scraped image upload error:", scrapeImgErr);
      }
    }

    // Automatically detect hardware platform / system category
    const autoDetectedCategory = detectPlatform(
      romName,
      extractedTitle,
      mainZip ? mainZip.getEntries().map((e: any) => e.entryName) : []
    );
    const finalCategory = (category && category !== "arcade" && category !== "auto") ? category : autoDetectedCategory;

    const cleanSlug = customSlug?.trim()
      ? customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-")
      : romName;

    const initialFiles = [
      {
        name: fileName,
        url: finalRomUrl,
        fileKey: finalRomKey,
        type: "rom",
        sizeBytes: finalZipBuffer.length,
        sizeText: `${sizeMb} MB`,
      },
    ];

    const newGame = {
      id: romName,
      slug: cleanSlug,
      title: extractedTitle,
      shortTitle: extractedTitle.split("(")[0].trim(),
      category: finalCategory,
      sizeText: `${sizeMb} MB`,
      desc: `Cloud hosted on UploadThing (${fileName})`,
      romUrl: finalRomUrl,
      romKey: finalRomKey,
      files: initialFiles,
      imageUrl: finalImageUrl,
      imageKey: finalImageKey,
      directLink: trimmedUrl.startsWith("http") && !trimmedUrl.includes("retrogames") ? trimmedUrl : undefined,
      addedAt: Date.now(),
    };

    // 5. Save metadata directly to MongoDB via Prisma
    await saveStoredGame(newGame);

    return NextResponse.json({
      success: true,
      game: newGame,
      message: `Success! Game uploaded with all dependencies (parent ROM / BIOS / cover) and saved to MongoDB Atlas!`
    });

  } catch (err: any) {
    console.error("Import error:", err);
    return NextResponse.json({ error: err.message || "Failed to process import" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, games });
  } catch (err: any) {
    return NextResponse.json({ success: false, games: [], error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id } });
    if (game) {
      const keysToDelete = new Set<string>();

      // 1. Primary ROM key or URL
      const primaryRomKey = game.romKey || getUploadThingKey(game.romUrl);
      if (primaryRomKey) keysToDelete.add(primaryRomKey);

      // 2. Cover image key or URL
      const coverImageKey = game.imageKey || getUploadThingKey(game.imageUrl);
      if (coverImageKey) keysToDelete.add(coverImageKey);

      // 3. All attached files in game.files (ROM, BIOS, Parent ROM, Cheats, Patches, etc.)
      if (Array.isArray(game.files)) {
        for (const fileItem of game.files) {
          const fKey = fileItem.fileKey || getUploadThingKey(fileItem.url);
          if (fKey) keysToDelete.add(fKey);
        }
      }

      // 4. Batch delete all keys from UploadThing to guarantee 0 orphaned files
      if (keysToDelete.size > 0) {
        const keyList = Array.from(keysToDelete);
        console.log(`[UploadThing] Cleaning up ${keyList.length} files for game '${game.id}':`, keyList);
        try {
          await utapi.deleteFiles(keyList);
        } catch (e) {
          console.warn("[UploadThing] Batch delete warning:", e);
        }
      }

      // 5. Delete from MongoDB via Prisma
      await prisma.game.delete({ where: { id } });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Game, ROM, image, and all attached files deleted successfully with zero orphaned files!" 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete game" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const category = (formData.get("category") as string) || "arcade";
    const imageFile = formData.get("imageFile") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (!id) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    let finalImageUrl = imageUrl || game.imageUrl;
    let finalImageKey = game.imageKey;

    // If user uploaded a new image, delete the previous image from UploadThing
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadImgRes = await utapi.uploadFiles([imageFile]);
        if (uploadImgRes[0]?.data?.ufsUrl || uploadImgRes[0]?.data?.url) {
          const oldImageKey = game.imageKey;
          
          finalImageUrl = uploadImgRes[0].data.ufsUrl || uploadImgRes[0].data.url;
          finalImageKey = uploadImgRes[0].data.key;

          // Delete previous image file from UploadThing to prevent orphaned files
          if (oldImageKey && oldImageKey !== finalImageKey) {
            try {
              console.log();
              await utapi.deleteFiles(oldImageKey);
            } catch (delErr) {
              console.warn("[UploadThing] Could not delete old image:", delErr);
            }
          }
        }
      } catch (imgErr) {
        console.error("Image upload to UploadThing failed:", imgErr);
      }
    } else if (!imageUrl && !imageFile && game.imageKey) {
      // User explicitly removed cover image
      try {
        console.log();
        await utapi.deleteFiles(game.imageKey);
      } catch (delErr) {
        console.warn("[UploadThing] Could not delete cleared image:", delErr);
      }
      finalImageUrl = null as any;
      finalImageKey = null as any;
    }

    const cleanSlug = slug?.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-")
      : game.slug;

    const finalCategory = (category && category !== "auto") 
      ? category 
      : detectPlatform(game.id, title || game.title);

    const updated = await prisma.game.update({
      where: { id },
      data: {
        title: title || game.title,
        shortTitle: (title || game.title).split("(")[0].trim(),
        slug: cleanSlug,
        category: finalCategory,
        imageUrl: finalImageUrl,
        imageKey: finalImageKey,
      },
    });

    return NextResponse.json({
      success: true,
      game: updated,
      message: "Game updated successfully!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update game" }, { status: 500 });
  }
}
