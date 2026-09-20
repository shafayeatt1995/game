// Persistent Settings & Control Scheme storage for Arcade games

export interface GameSettingsProfile {
  controls?: any;
  settings?: any;
  cheats?: any[];
  volume?: number;
  muted?: boolean;
}

const SETTINGS_PREFIX = "playsphere_arcade_settings_";

export function getGameSettingsKey(gameId: string): string {
  const normalized = (gameId || "default").replace(/\.zip$/i, "").toLowerCase();
  return `${SETTINGS_PREFIX}${normalized}`;
}

export function saveGameSettings(gameId: string, profile: GameSettingsProfile): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const key = getGameSettingsKey(gameId);
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.warn("Failed to persist arcade game settings to localStorage", err);
  }
}

export function loadGameSettings(gameId: string): GameSettingsProfile | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const key = getGameSettingsKey(gameId);
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch (err) {
    console.warn("Failed to load arcade game settings from localStorage", err);
    return null;
  }
}

/**
 * Pre-populates EmulatorJS localStorage keys if user has saved settings,
 * guaranteeing settings are loaded on the very first boot.
 */
export function ensureEmulatorJSSettings(gameId: string, resolvedGameName: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    // EmulatorJS local storage key format: "ejs-" + identifier + "-settings"
    // identifier = (gameId || 1) + "-" + core + "-" + gameName
    const ejsKey = `ejs-${gameId}-arcade-${resolvedGameName}-settings`;
    const profile = loadGameSettings(gameId);
    if (profile && !localStorage.getItem(ejsKey)) {
      const coreSpecific = {
        controlSettings: profile.controls || {},
        settings: profile.settings || {},
        cheats: profile.cheats || [],
      };
      localStorage.setItem(ejsKey, JSON.stringify(coreSpecific));
    }
  } catch (err) {
    console.warn("ensureEmulatorJSSettings error:", err);
  }
}
