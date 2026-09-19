"use client";

import React, { useState } from "react";
import { Keyboard, Info, Cpu, SlidersHorizontal, Sparkles, CheckCircle2, Zap } from "lucide-react";

interface PS1SidebarProps {
  onOpenSettings: () => void;
}

export default function PS1Sidebar({ onOpenSettings }: PS1SidebarProps) {
  const [activeTab, setActiveTab] = useState<"controls" | "info" | "compatibility">("controls");

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
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
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "info"
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Info className="h-3.5 w-3.5" />
          Features
        </button>
        <button
          onClick={() => setActiveTab("compatibility")}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "compatibility"
              ? "bg-indigo-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          Help
        </button>
      </div>

      {/* Tab 1: Controls mapping */}
      {activeTab === "controls" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">PS1 Button</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Default Keyboard Key</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">D-Pad</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold">Arrow Keys (↑ ↓ ← →)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Cross (✕) / Square (□)</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold">Z / A</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Circle (○) / Triangle (△)</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-rose-400 font-bold">X / S</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Start / Select</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-amber-400 font-bold">Enter / Shift</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">L1 / L2</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-300 font-bold">Q / E</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-300">R1 / R2</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-300 font-bold">W / R</span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Customize Keyboard / Gamepad Keys
          </button>

          <div className="mt-1 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              USB / Bluetooth Gamepad Support
            </p>
            <p className="text-indigo-300/80 leading-relaxed">
              Plug in any PS4, PS5, Xbox, or generic USB/Bluetooth controller for instant plug-and-play gaming.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Info & Features */}
      {activeTab === "info" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
          <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            PS1 Engine & Performance
          </h3>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <div>
                <strong className="text-white">Rock-Solid 60 FPS:</strong> PlayStation 1 PCSX ReARMed core compiled to WebAssembly runs at full speed with minimal overhead.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <div>
                <strong className="text-white">Legendary Titles:</strong> Gran Turismo 1 & 2, Tekken 3, Crash Team Racing, Metal Gear Solid run flawlessly at 60 FPS.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <div>
                <strong className="text-white">Save State Support:</strong> Instantly save and load states directly from the emulator interface.
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Tab 3: Compatibility Notice */}
      {activeTab === "compatibility" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Zap className="h-4 w-4" />
            100% Full-Speed Compatibility
          </div>
          <p className="text-zinc-300 leading-relaxed">
            Over 99.9% of PlayStation 1 titles run at smooth 60 FPS in modern browsers without frame drops.
          </p>
          <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-zinc-400">
            <strong className="text-zinc-200 block mb-1">Recommended Top PS1 Games:</strong>
            Tekken 3, Gran Turismo 2, Resident Evil 2 & 3, Castlevania: Symphony of the Night, Crash Bandicoot, Pepsiman, and more.
          </div>
        </div>
      )}
    </div>
  );
}
