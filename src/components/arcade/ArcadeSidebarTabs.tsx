"use client";

import React, { useState } from "react";
import { Keyboard, HardDrive, Sparkles, Sliders, Check } from "lucide-react";
import { ARCADE_CHEATS_DATABASE, getCheatsForGame } from "@/lib/arcadeCheats";

interface ArcadeSidebarTabsProps {
  gameId?: string;
  slug?: string;
}

export default function ArcadeSidebarTabs({ gameId, slug }: ArcadeSidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<"cheats" | "controls" | "settings" | "storage">("cheats");
  const availableCheats = getCheatsForGame(gameId || "", slug);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 flex gap-1 text-xs">
        <button
          onClick={() => setActiveTab("cheats")}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "cheats"
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          Cheats
          {availableCheats.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              {availableCheats.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "settings"
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
          Auto-Save
        </button>
        <button
          onClick={() => setActiveTab("controls")}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "controls"
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Keyboard className="h-3.5 w-3.5" />
          Controls
        </button>
        <button
          onClick={() => setActiveTab("storage")}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "storage"
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          Storage
        </button>
      </div>

      {/* Tab 0: Cheats */}
      {activeTab === "cheats" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Game Cheats & In-Game Menu
            </h4>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              In-Game Enabled
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed text-[11px]">
            All cheat codes are automatically injected into EmulatorJS! During gameplay, click the emulator menu bar or press <strong>Cheats</strong> to toggle them with checkboxes. Your cheat toggles are automatically saved in browser storage.
          </p>

          <div className="space-y-1.5 pt-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {availableCheats.length > 0 ? (
              availableCheats.map(([desc, code], idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 hover:border-amber-500/30 transition-all font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span className="text-zinc-200 font-semibold text-xs">{desc}</span>
                  </div>
                  <span className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded">
                    {code}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
                Custom game: You can add cheats directly from the in-game Emulator menu!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Auto-Save & Persistent Settings */}
      {activeTab === "settings" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              Settings & Memory Persistence
            </h4>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="h-3 w-3" /> Auto-Saved
            </span>
          </div>

          <p className="text-zinc-300 leading-relaxed text-[11px]">
            Every setting you configure is now permanently bound to this specific game and stored in your browser's persistent storage (LocalStorage & IndexedDB):
          </p>

          <ul className="space-y-2 text-zinc-300 text-[11px]">
            <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <strong className="text-indigo-400 block mb-0.5">🎮 Controls & Keybindings:</strong>
              Any remapped keys or gamepad buttons stay permanently saved for each game.
            </li>
            <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <strong className="text-emerald-400 block mb-0.5">🔊 Audio & Volume:</strong>
              Volume levels and mute preferences remain preserved across reloads.
            </li>
            <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <strong className="text-amber-400 block mb-0.5">✨ Cheats Status:</strong>
              Toggled cheats stay active the next time you start the game without needing re-entry.
            </li>
          </ul>
        </div>
      )}

      {/* Tab 2: Controls */}
      {activeTab === "controls" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs font-mono">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Cadillacs, Punisher & KOF Arcade Controls
          </span>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400">Insert Coin</span>
              <span className="text-amber-400 font-bold">Shift or 5 / 6</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400">Start / 1P</span>
              <span className="text-emerald-400 font-bold">Enter or 1 / 2</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400">Joystick (Direction)</span>
              <span className="text-cyan-400 font-bold">Arrow Keys / W,A,S,D</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400">Attack / Punch (Button A)</span>
              <span className="text-indigo-400 font-bold">Z or J</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400">Jump / Kick (Button B)</span>
              <span className="text-indigo-300 font-bold">X or K</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
              <span className="text-zinc-400">Special Move</span>
              <span className="text-indigo-400 font-bold">Z + X Together</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Gamepad / USB Controller</span>
              <span className="text-purple-400 font-bold">Auto-Detected</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: IndexedDB Browser Storage */}
      {activeTab === "storage" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-white flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-emerald-400" />
            IndexedDB Offline Browser Storage
          </h4>
          <p className="text-zinc-300 leading-relaxed">
            Powered by your browser's persistent <strong>IndexedDB object store</strong>.
          </p>
          <ul className="space-y-2 text-zinc-300">
            <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <strong className="text-indigo-400 block mb-0.5">Download Once:</strong>
              The first time you click a game, the ROM file is downloaded and cached directly inside your browser storage.
            </li>
            <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <strong className="text-emerald-400 block mb-0.5">Zero Future Downloads:</strong>
              Subsequent runs launch instantaneously in less than a second even without an active internet connection.
            </li>
            <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <strong className="text-cyan-400 block mb-0.5">100% Private:</strong>
              ROM files remain stored locally on your device without transmitting data to external servers.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
