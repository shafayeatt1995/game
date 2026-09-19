import { NextRequest, NextResponse } from "next/server";
import { getStoredGames, saveStoredGame, deleteStoredGame } from "@/lib/CustomGamesStore";
import { utapi } from "@/lib/uploadthing";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || searchParams.get("type") || undefined;
  const games = await getStoredGames(category);
  return NextResponse.json({ games });
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Check if game has UploadThing keys to clean up
    try {
      const gameInDb = await prisma.game.findUnique({
        where: { id },
      });

      const keysToDelete: string[] = [];
      if (gameInDb?.romKey) keysToDelete.push(gameInDb.romKey);
      if (gameInDb?.imageKey) keysToDelete.push(gameInDb.imageKey);

      if (keysToDelete.length > 0) {
        await utapi.deleteFiles(keysToDelete);
      }
    } catch (dbErr) {
      console.error("Error cleaning up UploadThing files:", dbErr);
    }

    await deleteStoredGame(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
      inputUrl = (formData.get("inputUrl") as string) || "";
      customTitle = (formData.get("customTitle") as string) || "";
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
    let romName = "";
    let extractedTitle = customTitle?.trim() || "";

    // Case 1: URL from RetroGames.cc page (e.g. https://www.retrogames.cc/arcade-games/cadillacs-dinosaurs-930201-etc.html)
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

        // Extract title if not provided
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
          }
        }

        // If not found from embed HTML, guess standard filesus3 CDN
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
    // Case 2: Direct EmulatorJS API (https://www.emulatorjs.com/api/fba?name=dino.zip)
    else if (trimmedUrl.includes("emulatorjs.com/api/fba") || trimmedUrl.includes("?name=")) {
      const parsed = new URL(trimmedUrl);
      const nameParam = parsed.searchParams.get("name") || "";
      romName = nameParam.replace(".zip", "").toLowerCase();
      resolvedDownloadUrl = `https://filesus3.retrogames.cc/rom/19/new/${nameParam.endsWith(".zip") ? nameParam : nameParam + ".zip"}`;
    } 
    // Case 3: Direct .zip file URL
    else if (trimmedUrl.endsWith(".zip")) {
      resolvedDownloadUrl = trimmedUrl;
    }

    if (!resolvedDownloadUrl) {
      return NextResponse.json({
        error: "Could not extract ROM download link from this URL. Please provide a direct .zip URL or an EmulatorJS API link."
      }, { status: 400 });
    }

    // Determine romName from resolvedDownloadUrl
    if (!romName) {
      const parts = resolvedDownloadUrl.split("/");
      romName = parts[parts.length - 1].replace(".zip", "").toLowerCase();
    }

    if (!extractedTitle) {
      extractedTitle = romName.toUpperCase();
    }

    // 1. Download ROM archive from remote server
    const fileRes = await fetch(resolvedDownloadUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.retrogames.cc/",
        "Accept": "*/*",
      },
    });

    if (!fileRes.ok) {
      return NextResponse.json({
        error: `Failed to fetch ROM file from remote server (HTTP ${fileRes.status}: ${fileRes.statusText})`
      }, { status: 500 });
    }

    const romBuffer = Buffer.from(await fileRes.arrayBuffer());
    const sizeMb = (romBuffer.length / (1024 * 1024)).toFixed(1);
    const fileName = `${romName}.zip`;

    // 2. Upload ROM directly to UploadThing storage
    const romFile = new File([romBuffer], fileName, { type: "application/zip" });
    const uploadRomRes = await utapi.uploadFiles([romFile]);

    if (!uploadRomRes[0]?.data?.ufsUrl && !uploadRomRes[0]?.data?.url) {
      const errMsg = uploadRomRes[0]?.error?.message || "Failed to upload ROM to UploadThing storage";
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const uploadedRomData = uploadRomRes[0].data;
    const finalRomUrl = uploadedRomData.ufsUrl || uploadedRomData.url;
    const finalRomKey = uploadedRomData.key;

    // 3. Upload Game Image to UploadThing if provided
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
    }

    const cleanSlug = customSlug?.trim()
      ? customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-")
      : romName;

    const newGame = {
      id: romName,
      slug: cleanSlug,
      title: extractedTitle,
      shortTitle: extractedTitle.split("(")[0].trim(),
      category: category,
      sizeText: `${sizeMb} MB`,
      desc: `Cloud hosted on UploadThing (${fileName})`,
      romUrl: finalRomUrl,
      romKey: finalRomKey,
      imageUrl: finalImageUrl,
      imageKey: finalImageKey,
      directLink: trimmedUrl.startsWith("http") ? trimmedUrl : undefined,
      addedAt: Date.now(),
    };

    // 4. Save metadata directly to MongoDB via Prisma
    await saveStoredGame(newGame);

    return NextResponse.json({
      success: true,
      game: newGame,
      message: `Success! Game uploaded to UploadThing storage and metadata stored in MongoDB Atlas!`
    });

  } catch (err: any) {
    console.error("Import error:", err);
    return NextResponse.json({ error: err.message || "Failed to process import" }, { status: 500 });
  }
}

