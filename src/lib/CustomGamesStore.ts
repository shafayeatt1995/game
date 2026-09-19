import fs from "fs";
import path from "path";
import prisma from "./prisma";

export interface CustomGame {
  id: string;
  slug?: string;
  title: string;
  shortTitle: string;
  category: "CPS-1.5" | "Neo Geo" | "Arcade" | string;
  sizeText: string;
  desc: string;
  romUrl: string;
  romKey?: string;
  directLink?: string;
  embedUrl?: string;
  imageUrl?: string;
  imageKey?: string;
  addedAt?: number;
}

const DATA_FILE = path.join(process.cwd(), "public", "roms", "games.json");

function getLocalJsonGames(): CustomGame[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getStoredGames(filterCategory?: string): Promise<CustomGame[]> {
  try {
    const whereClause: any = {};
    if (filterCategory) {
      whereClause.category = filterCategory.trim().toLowerCase();
    }

    const dbGames = await prisma.game.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    if (dbGames && dbGames.length > 0) {
      return dbGames.map((g) => ({
        id: g.id,
        slug: g.slug || undefined,
        title: g.title,
        shortTitle: g.shortTitle,
        category: (g.category || "arcade").toLowerCase(),
        sizeText: g.sizeText,
        desc: g.desc,
        romUrl: g.romUrl,
        romKey: g.romKey || undefined,
        directLink: g.directLink || undefined,
        embedUrl: g.embedUrl || undefined,
        imageUrl: g.imageUrl || undefined,
        imageKey: g.imageKey || undefined,
        addedAt: g.addedAt ? new Date(g.addedAt).getTime() : undefined,
      }));
    }
  } catch (err) {
    console.error("Prisma query failed, falling back to local games.json:", err);
  }

  return getLocalJsonGames();
}

export async function saveStoredGame(game: CustomGame): Promise<void> {
  const normalizedCategory = (game.category || "arcade").trim().toLowerCase();

  // 1. Save to MongoDB via Prisma
  try {
    await prisma.game.upsert({
      where: { id: game.id },
      create: {
        id: game.id,
        slug: game.slug || game.id,
        title: game.title,
        shortTitle: game.shortTitle,
        category: normalizedCategory,
        sizeText: game.sizeText,
        desc: game.desc,
        romUrl: game.romUrl,
        romKey: game.romKey || null,
        directLink: game.directLink || null,
        embedUrl: game.embedUrl || null,
        imageUrl: game.imageUrl || null,
        imageKey: game.imageKey || null,
        addedAt: game.addedAt ? new Date(game.addedAt) : new Date(),
      },
      update: {
        slug: game.slug || game.id,
        title: game.title,
        shortTitle: game.shortTitle,
        category: normalizedCategory,
        sizeText: game.sizeText,
        desc: game.desc,
        romUrl: game.romUrl,
        romKey: game.romKey || null,
        directLink: game.directLink || null,
        embedUrl: game.embedUrl || null,
        imageUrl: game.imageUrl || null,
        imageKey: game.imageKey || null,
      },
    });
  } catch (err) {
    console.error("Failed to save game to Prisma database:", err);
  }

  // 2. Also keep local JSON backup
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const existing = getLocalJsonGames();
    const updated = [game, ...existing.filter((g) => g.id !== game.id)];
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving backup games.json:", err);
  }
}

export async function deleteStoredGame(id: string): Promise<void> {
  // 1. Delete from MongoDB via Prisma
  try {
    await prisma.game.deleteMany({
      where: { id },
    });
  } catch (err) {
    console.error("Failed to delete game from Prisma:", err);
  }

  // 2. Delete from local JSON backup
  try {
    const existing = getLocalJsonGames();
    const updated = existing.filter((g) => g.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error deleting from backup games.json:", err);
  }
}
