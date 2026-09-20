/**
 * Automatically detects the arcade platform / system category from ROM name,
 * title, URL, or zip entries.
 */
export function detectPlatform(romName: string, title?: string, entryNames: string[] = []): string {
  const r = (romName || "").toLowerCase();
  const t = (title || "").toLowerCase();
  const lowerEntries = entryNames.map((e) => e.toLowerCase());

  // 1. Check SNK Neo-Geo MVS / AES
  const isNeoGeo =
    r.startsWith("kof") ||
    r.startsWith("kf2k") ||
    r.startsWith("mslug") ||
    r.startsWith("samsho") ||
    r.startsWith("fatfur") ||
    r.startsWith("aof") ||
    r.startsWith("rbff") ||
    r.startsWith("neogeo") ||
    r.includes("neogeo") ||
    t.includes("king of fighters") ||
    t.includes("metal slug") ||
    t.includes("samurai shodown") ||
    t.includes("fatal fury") ||
    lowerEntries.some(
      (n) =>
        n.includes("-c1.") ||
        n.includes("-s1.") ||
        n.includes("-m1.") ||
        n.includes("-v1.") ||
        n.includes("-p1.") ||
        n.includes("sp-s3") ||
        n.includes("sfix")
    );

  if (isNeoGeo) {
    return "Neo Geo";
  }

  // 2. Check Capcom CPS-1.5 (Q-Sound)
  const isCps15 =
    r.startsWith("dino") ||
    r.startsWith("punish") ||
    r.startsWith("wof") ||
    r.startsWith("slammast") ||
    t.includes("cadillacs") ||
    t.includes("punisher") ||
    t.includes("warriors of fate") ||
    t.includes("slam masters");

  if (isCps15) {
    return "CPS-1.5";
  }

  // 3. Check Capcom CPS-1
  const isCps1 =
    r.startsWith("ffight") ||
    r.startsWith("sf2") ||
    r.startsWith("strider") ||
    r.startsWith("ghouls") ||
    r.startsWith("captcomm") ||
    t.includes("final fight") ||
    t.includes("street fighter ii") ||
    t.includes("captain commando") ||
    t.includes("strider") ||
    t.includes("ghouls 'n ghosts");

  if (isCps1) {
    return "CPS-1";
  }

  // 4. Check Capcom CPS-2
  const isCps2 =
    r.startsWith("sfa") ||
    r.startsWith("sfz") ||
    r.startsWith("vsav") ||
    r.startsWith("dstlk") ||
    r.startsWith("nwarr") ||
    r.startsWith("avsp") ||
    r.startsWith("msh") ||
    r.startsWith("xmvsf") ||
    r.startsWith("mvsc") ||
    r.startsWith("hsf2") ||
    t.includes("street fighter alpha") ||
    t.includes("vampire savior") ||
    t.includes("darkstalkers") ||
    t.includes("alien vs predator") ||
    t.includes("marvel super heroes") ||
    t.includes("x-men vs street fighter") ||
    t.includes("marvel vs capcom");

  if (isCps2) {
    return "CPS-2";
  }

  // 5. Check Capcom CPS-3
  const isCps3 =
    r.startsWith("sfiii") ||
    r.startsWith("jojoba") ||
    r.startsWith("redearth") ||
    r.startsWith("warzard") ||
    t.includes("street fighter iii") ||
    t.includes("third strike") ||
    t.includes("jojo");

  if (isCps3) {
    return "CPS-3";
  }

  // Default fallback for other MAME / FinalBurn arcade titles
  return "Arcade";
}
