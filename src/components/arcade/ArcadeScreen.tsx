"use client";

import React, { useRef } from "react";
import { 
  Maximize2, 
  Play, 
  FolderOpen, 
  Zap, 
  Sword, 
  Download, 
  CheckCircle2, 
  Gamepad2, 
  ExternalLink 
} from "lucide-react";
import { RetroGamePreset } from "@/components/ArcadeEmulator";

interface ArcadeScreenProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedGame: RetroGamePreset | null;
  isPlaying: boolean;
  isIframePlaying: boolean;
  iframeUrl: string;
  isDownloading: boolean;
  downloadProgress: number;
  isLoadingGames: boolean;
  cachedIds: string[];
  showFps: boolean;
  fps: number;
  statusText: string;
  onPlayViaOnlineStream: (game: RetroGamePreset) => void;
  onSelectAndPlay: (game: RetroGamePreset) => void;
  onLocalFileSelect: (file: File) => void;
  onStopGame: () => void;
  onToggleFullscreen: () => void;
}

export default function ArcadeScreen({
  containerRef,
  selectedGame,
  isPlaying,
  isIframePlaying,
  iframeUrl,
  isDownloading,
  downloadProgress,
  isLoadingGames,
  cachedIds,
  showFps,
  fps,
  statusText,
  onPlayViaOnlineStream,
  onSelectAndPlay,
  onLocalFileSelect,
  onStopGame,
  onToggleFullscreen,
}: ArcadeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      {/* Main Emulator Display Box */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl bg-black border border-zinc-800/80 shadow-2xl overflow-hidden flex items-center justify-center aspect-[4/3] max-h-[62vh]"
      >
        {/* Iframe Cloud Stream Player */}
        {isIframePlaying && iframeUrl ? (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <iframe
              src={iframeUrl}
              title={selectedGame?.title || "Arcade Game"}
              className="w-full h-full border-0"
              allowFullScreen
              allow="cross-origin-isolated; autoplay; gamepad; fullscreen"
            />
          </div>
        ) : (
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

                    <h2 className="text-xl font-bold mb-1 text-white">{selectedGame.title}</h2>
                    <p className="text-xs text-zinc-400 mb-6 max-w-md">{selectedGame.desc}</p>

                    <div className="flex flex-col gap-2.5 w-full max-w-md">
                      {/* Instant 60 FPS Cloud Stream Button */}
                      {(selectedGame.embedUrl || selectedGame.id === "dino") && (
                        <button
                          onClick={() => onPlayViaOnlineStream(selectedGame)}
                          className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer group"
                        >
                          <Zap className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
                          <span>Play Instant 60 FPS (Zero Setup / Cloud Stream)</span>
                        </button>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                        <button
                          onClick={() => onSelectAndPlay(selectedGame)}
                          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {cachedIds.includes(selectedGame.id) ? (
                            <>
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>Local Core (WebAssembly)</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5" />
                              <span>Download Local ROM ({selectedGame.sizeText})</span>
                            </>
                          )}
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".zip,.7z,.rom"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              onLocalFileSelect(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Play a local .zip arcade file from your computer"
                        >
                          <FolderOpen className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Local ROM</span>
                        </button>
                      </div>
                    </div>

                    {cachedIds.includes(selectedGame.id) && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Saved in Browser Memory (Offline ready)</span>
                      </div>
                    )}

                    {/* Direct tab link */}
                    {selectedGame.directLink && (
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full max-w-md flex justify-center">
                        <a
                          href={selectedGame.directLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-zinc-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                        >
                          <span>Open in standalone retro window</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

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
            className={`h-2.5 w-2.5 rounded-full ${
              isPlaying
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
