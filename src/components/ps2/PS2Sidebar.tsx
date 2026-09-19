"use client";

import React, { useState } from "react";
import { 
  Keyboard, 
  Info, 
  Cpu, 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

interface PS2SidebarProps {
  onOpenSettings: () => void;
}

export default function PS2Sidebar({ onOpenSettings }: PS2SidebarProps) {
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
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">PS2 Button</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Keyboard Key</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">D-Pad</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold">Arrow Keys (↑ ↓ ← →)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Left Analog Stick</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold">T (Up), G (Down), F (Left), H (Right)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Right Analog Stick</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold">I, K, J, L</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Cross (✕) / Square (□)</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-emerald-400 font-bold">Z / A</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Circle (○) / Triangle (△)</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-rose-400 font-bold">X / S</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">Start / Select</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-amber-400 font-bold">Enter / Backspace</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
              <span className="text-zinc-300">L1 / L2 / L3</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-300 font-bold">1 / 2 / 3</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-300">R1 / R2 / R3</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-300 font-bold">8 / 9 / 0</span>
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
              Connect any PS4, PS5, or Xbox controller for instant native browser gamepad control.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Info & Features */}
      {activeTab === "info" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
          <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Platform Architecture
          </h3>
          <ul className="space-y-3 text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <div>
                <strong className="text-white">Zero Server Uploads:</strong> Your game files never leave your computer. The engine reads local sectors via asynchronous streaming.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <div>
                <strong className="text-white">No BIOS Files Required:</strong> Play! High-Level Emulation (HLE) boots game binaries directly.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <div>
                <strong className="text-white">Scaling & Aspect Ratio:</strong> Maintains authentic 4:3 PS2 proportions across both windowed and fullscreen displays.
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Tab 3: Compatibility Notice */}
      {activeTab === "compatibility" && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4" />
            Compatibility & Performance
          </div>
          <p className="text-zinc-300 leading-relaxed">
            The Play! WebAssembly port is experimental. Many 2D and lightweight 3D games run smoothly, while heavy 3D titles may experience lower framerates.
          </p>
          <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-zinc-400">
            <strong className="text-zinc-200 block mb-1">Recommended Tips:</strong>
            • Ensure Hardware Acceleration is enabled in your browser settings.
            • For maximum framerates on heavy 3D titles like GTA, consider the native reVC Source Port tab.
          </div>
        </div>
      )}
    </div>
  );
}
