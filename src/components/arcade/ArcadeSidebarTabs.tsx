"use client";

import React, { useState } from "react";
import { Keyboard, HardDrive, Info, Cpu } from "lucide-react";

export default function ArcadeSidebarTabs() {
  const [activeTab, setActiveTab] = useState<"controls" | "storage" | "how">("controls");

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 flex gap-1 text-xs">
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
        <button
          onClick={() => setActiveTab("how")}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "how"
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Info className="h-3.5 w-3.5" />
          Technology
        </button>
      </div>

      {/* Tab 1: Controls */}
      {activeTab === "controls" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs font-mono">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Cadillacs & KOF Keyboard Controls
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
              <span className="text-zinc-400">Mustapha Special Attack</span>
              <span className="text-indigo-400 font-bold">Z + X Together</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Gamepad / USB Controller</span>
              <span className="text-purple-400 font-bold">Auto-Detected</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: IndexedDB Browser Storage */}
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

      {/* Tab 3: Tech */}
      {activeTab === "how" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
          <h4 className="font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            Capcom CPS & SNK Neo Geo Arcade Engine
          </h4>
          <p className="text-zinc-300 leading-relaxed">
            Cadillacs and Dinosaurs (1993) and King of Fighters (1998-2002) run via optimized FinalBurn Neo and MAME WebAssembly cores, utilizing hardware-accelerated WebGL rendering for 60 FPS gameplay.
          </p>
        </div>
      )}
    </div>
  );
}
