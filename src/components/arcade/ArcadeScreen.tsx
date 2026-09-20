"use client";

import React from "react";
import {
  Maximize2,
  Play,
  Sword,
  Download,
  CheckCircle2,
  Gamepad2
} from "lucide-react";
import { RetroGamePreset } from "@/components/ArcadeEmulator";

interface ArcadeScreenProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedGame: RetroGamePreset | null;
  isPlaying: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  isLoadingGames: boolean;
  cachedIds: string[];
  showFps: boolean;
  fps: number;
  statusText: string;
  onSelectAndPlay: (game: RetroGamePreset) => void;
  onStopGame: () => void;
  onToggleFullscreen: () => void;
}

export default function ArcadeScreen({
  containerRef,
  selectedGame,
  isPlaying,
  isDownloading,
  downloadProgress,
  isLoadingGames,
  cachedIds,
  showFps,
  fps,
  statusText,
  onSelectAndPlay,
  onStopGame,
  onToggleFullscreen,
}: ArcadeScreenProps) {
  return (
    <>
      {/* Main Emulator Display Box */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl bg-black border border-zinc-800/80 shadow-2xl overflow-hidden flex items-center justify-center aspect-[4/3] max-h-[62vh]"
      >
        <div id="arcade-game-container" className="w-full h-full flex items-center justify-center">
          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90">
              {/* Downloading Progress Bar Overlay */}
              {isDownloading && selectedGame ? (
                <div className="flex flex-col items-center max-w-sm w-full p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl">
                  <div className="h-12 w-12 mb-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-bounce">
                    <Download className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white mb-1">Downloading Game...</h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    {selectedGame.title} ({selectedGame.sizeText})
                  </p>

                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between w-full text-[11px] font-mono text-zinc-400">
                    <span>Saving in Browser Memory</span>
                    <span className="text-indigo-400 font-bold">{downloadProgress}%</span>
                  </div>
                </div>
              ) : isLoadingGames ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <p className="text-xs text-zinc-400">Loading game from database...</p>
                </div>
              ) : !selectedGame ? (
                <div className="flex flex-col items-center justify-center max-w-md">
                  <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                    <Gamepad2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">No Game Selected</h2>
                  <p className="text-xs text-zinc-400 mb-4">
                    Select a game from the library below or import a new game from the admin dashboard.
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-900 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
                    <Sword className="h-8 w-8 text-indigo-400" />
                  </div>

                  <h2 className="text-xl font-bold mb-5 text-white">{selectedGame.title}</h2>

                  <div className="flex flex-col gap-2.5 w-full max-w-md">
                    <button
                      onClick={() => onSelectAndPlay(selectedGame)}
                      className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* In-Game Always-On-Top FPS Display */}
        {isPlaying && showFps && (
          <div className="absolute top-4 right-4 z-50 pointer-events-none select-none flex items-center gap-2 bg-black/75 backdrop-blur-md border border-zinc-700/80 px-3 py-1.5 rounded-xl text-xs font-mono shadow-2xl">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-400 font-bold">FPS:</span>
            <span className="text-emerald-400 font-extrabold">{fps}</span>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${isPlaying
              ? "bg-emerald-400 animate-pulse"
              : isDownloading
                ? "bg-indigo-400 animate-pulse"
                : "bg-indigo-400"
              }`}
          ></span>
          <span className="font-mono">{statusText}</span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-3">
            <button
              onClick={onStopGame}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Stop Game</span>
            </button>
            <button
              onClick={onToggleFullscreen}
              className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="h-3 w-3 text-indigo-400" />
              Fullscreen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
