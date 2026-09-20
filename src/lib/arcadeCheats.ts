// Standard Libretro / FBNeo Cheat format codes: [Description, CheatCode]
// Format in Libretro / EmulatorJS:
// RAM patches: "address:value" or "address+value" or Libretro cheat code format "AAAAAA+VV" (hex)

export interface GameCheatItem {
  desc: string;
  code: string;
}

export const ARCADE_CHEATS_DATABASE: Record<string, [string, string][]> = {
  // Cadillacs and Dinosaurs (CPS 1.5)
  dino: [
    ["Infinite Energy P1", "FF83B3+64"],
    ["Infinite Lives P1", "FF83B5+09"],
    ["Invincibility P1", "FF83A1+64"],
    ["Infinite Ammo / Guns P1", "FF83C9+FF"],
    ["Infinite Time", "FF8015+63"],
    ["Infinite Energy P2", "FF85B3+64"],
    ["Infinite Lives P2", "FF85B5+09"],
    ["Invincibility P2", "FF85A1+64"],
    ["Infinite Ammo / Guns P2", "FF85C9+FF"],
  ],

  // The Punisher (CPS 1.5)
  punisher: [
    ["Infinite Energy P1", "FF187D+58"],
    ["Infinite Lives P1", "FF187F+05"],
    ["Invincibility P1", "FF1801+64"],
    ["Infinite Handgun Ammo P1", "FF1887+08"],
    ["Infinite Super Grenades P1", "FF1885+03"],
    ["Infinite Time", "FF1823+63"],
    ["Infinite Energy P2", "FF1A7D+58"],
    ["Infinite Lives P2", "FF1A7F+05"],
    ["Invincibility P2", "FF1A01+64"],
  ],
  punisheru: [
    ["Infinite Energy P1", "FF187D+58"],
    ["Infinite Lives P1", "FF187F+05"],
    ["Invincibility P1", "FF1801+64"],
    ["Infinite Handgun Ammo P1", "FF1887+08"],
    ["Infinite Super Grenades P1", "FF1885+03"],
    ["Infinite Time", "FF1823+63"],
    ["Infinite Energy P2", "FF1A7D+58"],
    ["Infinite Lives P2", "FF1A7F+05"],
    ["Invincibility P2", "FF1A01+64"],
  ],

  // The King of Fighters 2002 / 2002 Super
  kof2002: [
    ["Infinite Health P1", "10816A+67"],
    ["Infinite Max Power Gauge P1", "108170+05"],
    ["Full Power Gauge Mode P1", "108171+05"],
    ["Infinite Time", "10834B+60"],
    ["Drain Health P2 / CPU", "10836A+00"],
    ["No Power Gauge P2 / CPU", "108370+00"],
  ],
  kf2k2plc: [
    ["Infinite Health P1", "10816A+67"],
    ["Infinite Max Power Gauge P1", "108170+05"],
    ["Full Power Gauge Mode P1", "108171+05"],
    ["Infinite Time", "10834B+60"],
    ["Drain Health P2 / CPU", "10836A+00"],
    ["No Power Gauge P2 / CPU", "108370+00"],
  ],

  // Metal Slug 1, X, 3
  mslug: [
    ["Infinite Lives P1", "1090BE+09"],
    ["Infinite Ammo P1", "1090C8+03E7"],
    ["Infinite Bombs / Grenades P1", "1090C9+63"],
    ["Invincibility P1", "1090C6+01"],
    ["Infinite Gas / Vehicle Armor", "109506+40"],
    ["Infinite Time", "108DDE+60"],
  ],
  mslugx: [
    ["Infinite Lives P1", "10A3EE+09"],
    ["Infinite Ammo P1", "10A3F8+03E7"],
    ["Infinite Bombs / Grenades P1", "10A3F9+63"],
    ["Invincibility P1", "10A3F6+01"],
    ["Infinite Time", "1091EE+60"],
  ],
  mslug3: [
    ["Infinite Lives P1", "10A3EE+09"],
    ["Infinite Ammo P1", "10A3F8+03E7"],
    ["Infinite Bombs P1", "10A3F9+63"],
    ["Invincibility P1", "10A3F6+01"],
    ["Infinite Time", "1091EE+60"],
  ],

  // Street Fighter II / CPS games
  sf2: [
    ["Infinite Energy P1", "FF86CE+A0"],
    ["Infinite Time", "FF8950+99"],
    ["Drain Energy P2 / CPU", "FF88CE+00"],
  ],
  sf2ce: [
    ["Infinite Energy P1", "FF86CE+A0"],
    ["Infinite Time", "FF8950+99"],
    ["Drain Energy P2 / CPU", "FF88CE+00"],
  ],
  sf2hf: [
    ["Infinite Energy P1", "FF86CE+A0"],
    ["Infinite Time", "FF8950+99"],
    ["Drain Energy P2 / CPU", "FF88CE+00"],
  ],
  hsf2: [
    ["Infinite Energy P1", "FF84B8+90"],
    ["Infinite Super Meter P1", "FF8540+30"],
    ["Infinite Time", "FF8108+99"],
    ["Drain Energy P2 / CPU", "FF88B8+00"],
  ],

  // Alien vs Predator
  avsp: [
    ["Infinite Energy P1", "FF891C+64"],
    ["Infinite Lives P1", "FF891E+05"],
    ["Invincibility P1", "FF8922+64"],
    ["Infinite Ammo P1", "FF8928+63"],
  ],

  // Captain Commando
  captcomm: [
    ["Infinite Energy P1", "FF82D1+60"],
    ["Infinite Lives P1", "FF82D3+05"],
    ["Invincibility P1", "FF8285+64"],
  ],

  // Warriors of Fate (Sangokushi II)
  wof: [
    ["Infinite Energy P1", "FF872E+80"],
    ["Infinite Lives P1", "FF8730+05"],
    ["Invincibility P1", "FF8722+64"],
  ],
};

/**
 * Returns an array of [description, code] tuples suitable for window.EJS_cheats
 */
export function getCheatsForGame(romId: string, slug?: string): [string, string][] {
  const normalizedId = (romId || "").replace(/\.zip$/i, "").toLowerCase().trim();
  const normalizedSlug = (slug || "").toLowerCase().trim();

  // 1. Direct match by ROM ID
  if (ARCADE_CHEATS_DATABASE[normalizedId]) {
    return ARCADE_CHEATS_DATABASE[normalizedId];
  }

  // 2. Match by Slug
  if (normalizedSlug) {
    for (const [key, cheats] of Object.entries(ARCADE_CHEATS_DATABASE)) {
      if (normalizedSlug.includes(key) || key.includes(normalizedSlug)) {
        return cheats;
      }
    }
  }

  // 3. Fallback matching patterns
  if (normalizedId.includes("dino") || normalizedSlug.includes("dino")) {
    return ARCADE_CHEATS_DATABASE.dino;
  }
  if (normalizedId.includes("punish") || normalizedSlug.includes("punish")) {
    return ARCADE_CHEATS_DATABASE.punisher;
  }
  if (normalizedId.includes("kof") || normalizedId.includes("kf2k") || normalizedSlug.includes("kof")) {
    return ARCADE_CHEATS_DATABASE.kof2002;
  }
  if (normalizedId.includes("mslug") || normalizedSlug.includes("metal-slug")) {
    return ARCADE_CHEATS_DATABASE.mslug;
  }
  if (normalizedId.includes("sf2") || normalizedSlug.includes("street-fighter")) {
    return ARCADE_CHEATS_DATABASE.sf2ce;
  }

  return [];
}
