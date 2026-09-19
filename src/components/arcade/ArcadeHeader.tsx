"use client";

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
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link
          href="/arcade"
          className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all group"
          title="Back to Arcade Games List"
        >
          <ChevronLeft className="h-4 w-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">All Games</span>
        </Link>
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Sword className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{selectedGame ? selectedGame.title : "PlaySphere Arcade"}</span>
            </h1>
            <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              60 FPS
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-400">
            {selectedGame ? `${selectedGame.shortTitle} • ${selectedGame.category}` : "Arcade & Neo-Geo Web Player"}
          </p>
        </div>
      </div>

      {/* Navigation - Mobile scrollable chip bar */}
      <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs">
        <Link href="/" className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0">
          Home
        </Link>
        <Link href="/arcade" className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm shrink-0">
          Arcade & Neo-Geo
        </Link>
        <Link href="/ps1" className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0">
          PS1 (60 FPS)
        </Link>
        <Link href="/ps2" className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0">
          PS2 (Play!)
        </Link>
        <Link href="/sourceports" className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0">
          reVC (GTA 60+)
        </Link>
        <Link href="/admin" className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 transition-colors shrink-0">
          Admin
        </Link>
      </nav>

      {/* Right Controls */}
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
    </header>
  );
}
