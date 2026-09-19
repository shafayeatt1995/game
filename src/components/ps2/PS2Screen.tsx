"use client";

import React, { useRef } from "react";
import { 
  Disc, 
  Play, 
  Pause, 
  FolderOpen, 
  Maximize2, 
  Minimize2 
} from "lucide-react";

interface PS2ScreenProps {
  screenWrapperRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isFullscreen: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  showFps: boolean;
  fps: number;
  selectedFile: File | null;
  isLoading: boolean;
  statusText: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (file: File) => void;
  onStartEmulator: () => void;
  onTogglePause: () => void;
  onToggleFullscreen: () => void;
}

export default function PS2Screen({
  screenWrapperRef,
  canvasRef,
  isFullscreen,
  isPlaying,
  isPaused,
  showFps,
  fps,
  selectedFile,
  isLoading,
  statusText,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onStartEmulator,
  onTogglePause,
  onToggleFullscreen,
}: PS2ScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="lg:col-span-2 flex flex-col gap-3">
      {/* Emulation Screen Container */}
      <div 
        ref={screenWrapperRef}
        className={`relative w-full rounded-2xl bg-black border border-zinc-800/80 shadow-2xl overflow-hidden flex items-center justify-center ${
          isFullscreen ? "fullscreen-active fixed inset-0 z-[9999] h-screen w-screen border-none rounded-none" : "aspect-[4/3]"
        }`}
      >
        {/* The Real WebGL Emscripten Canvas */}
        <canvas
          id="outputCanvas"
          ref={canvasRef}
          width={640}
          height={480}
          tabIndex={-1}
          className={`w-full h-auto cursor-default outline-none block ${
            isPlaying ? "opacity-100" : "opacity-0 absolute pointer-events-none"
          }`}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Pause Overlay Indicator */}
        {isPlaying && isPaused && (
          <div 
            onClick={onTogglePause}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer transition-all z-30"
          >
            <div className="h-16 w-16 rounded-full bg-indigo-600/90 flex items-center justify-center shadow-2xl text-white hover:scale-110 transition-transform">
              <Play className="h-8 w-8 fill-current ml-1" />
            </div>
            <p className="mt-4 text-base font-semibold text-zinc-200">Game is paused</p>
            <p className="text-xs text-zinc-400 mt-1">Click anywhere to resume</p>
          </div>
        )}

        {/* In-Game Always-On-Top FPS Display */}
        {isPlaying && showFps && (
          <div className="absolute top-4 right-4 z-50 pointer-events-none select-none flex items-center gap-2 bg-black/75 backdrop-blur-md border border-zinc-700/80 px-3 py-1.5 rounded-xl text-xs font-mono shadow-2xl">
            <span className={`inline-block w-2 h-2 rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`}></span>
            <span className="text-zinc-400 font-bold">{isPaused ? "PAUSED" : "FPS:"}</span>
            {!isPaused && (
              <span className={`font-extrabold ${fps >= 45 ? "text-emerald-400" : fps >= 25 ? "text-amber-400" : "text-rose-400"}`}>
                {fps}
              </span>
            )}
          </div>
        )}

        {/* In-Screen Floating Quick Action Bar */}
        {isPlaying && (
          <div className="absolute top-4 left-4 opacity-0 hover:opacity-100 transition-opacity z-40 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl px-2 py-1 flex items-center gap-1 shadow-lg">
            <button
              onClick={onTogglePause}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="h-4 w-4 fill-current text-emerald-400" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Overlay when game is NOT playing */}
        {!isPlaying && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all z-20 ${
              isDragOver ? "bg-indigo-950/40 border-2 border-dashed border-indigo-500" : "bg-zinc-950"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {/* Background Ambient Glow */}
            <div className="absolute w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
            <div className="absolute w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

            <div className="relative z-10 flex flex-col items-center max-w-md">
              <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shadow-xl group-hover:scale-105 transition-transform">
                <Disc className={`h-8 w-8 ${selectedFile ? "text-indigo-400 animate-spin" : "text-indigo-400"}`} />
              </div>

              <h2 className="text-lg sm:text-xl font-bold mb-2">
                {selectedFile ? selectedFile.name : "Select your PS2 game"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">
                {selectedFile 
                  ? `Size: ${(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB • Streamed locally from your browser`
                  : "Drag and drop your .ISO, .BIN, or .CHD file here or click browse"}
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".iso,.bin,.chd,.cso,.isz,.elf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onFileChange(e.target.files[0]);
                    }
                  }}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sm font-medium transition-all flex items-center gap-2 hover:border-zinc-500 shadow-md cursor-pointer"
                >
                  <FolderOpen className="h-4 w-4 text-indigo-400" />
                  Browse File
                </button>

                {selectedFile && (
                  <button
                    onClick={onStartEmulator}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        <span>Boot Game (Play!)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status and Action Bar under the canvas */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2.5 truncate">
          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
            !isPlaying 
              ? "bg-emerald-400" 
              : isPaused 
                ? "bg-amber-400" 
                : "bg-emerald-400 animate-pulse"
          }`}></span>
          <span className="font-mono truncate">{statusText}</span>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onTogglePause}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3" />}
              {isPaused ? "Resume" : "Pause"}
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={onToggleFullscreen}
              className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="h-3 w-3" />
              Fullscreen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
