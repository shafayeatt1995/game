"use client";

import { SiteHeader } from "@/components/SiteHeader";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Sword, SlidersHorizontal, Minimize2, Maximize2 } from "lucide-react";
import { RetroGamePreset } from "@/components/ArcadeEmulator";

interface ArcadeHeaderProps {
  selectedGame: RetroGamePreset | null;
  isPlaying: boolean;
  showFps: boolean;
  isFullscreen: boolean;
  fps: number;
  onToggleFps: (val: boolean) => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export default function ArcadeHeader({
  selectedGame,
  isPlaying,
  showFps,
  isFullscreen,
  fps,
  onToggleFps,
  onOpenSettings,
  onToggleFullscreen,
}: ArcadeHeaderProps) {
  return (
    <SiteHeader
      title={selectedGame ? selectedGame.title : "Retro Gaming Arcade"}
      subtitle={selectedGame ? `${selectedGame.shortTitle} • ${selectedGame.category}` : "Arcade & Neo-Geo Web Player"}
      badge="60 FPS"
      rightElements={
        
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs text-zinc-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showFps}
            onChange={(e) => onToggleFps(e.target.checked)}
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
          />
          <span className="font-medium text-[11px] sm:text-xs">FPS</span>
        </label>

        {isPlaying && showFps && !isFullscreen && (
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1.5 rounded-xl text-xs font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-400">FPS:</span>
            <span className="text-emerald-400 font-bold">{fps}</span>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          title="Controller Settings"
        >
          <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
          <span className="hidden md:inline">Controls</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4 text-indigo-400" /> : <Maximize2 className="h-4 w-4 text-indigo-400" />}
          <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </button>
      </div>
      }
    />
  );
}
