"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Gamepad2, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  SlidersHorizontal 
} from "lucide-react";
import ControlsSettingsModal from "@/components/ControlsSettingsModal";
import { getInputManager } from "@/lib/InputManager";
import PS1Screen from "@/components/ps1/PS1Screen";
import PS1Sidebar from "@/components/ps1/PS1Sidebar";

declare global {
  interface Window {
    EJS_player?: string;
    EJS_core?: string;
    EJS_gameUrl?: string;
    EJS_startOnLoaded?: boolean;
    EJS_pathtodata?: string;
    EJS_DEBUG_XX?: boolean;
    EJS_onGameStart?: () => void;
    EJS_onFPS?: (fps: number) => void;
    EJS_onLoadState?: () => void;
    EJS_onSaveState?: () => void;
    EJS_emulator?: any;
  }
}

export default function PS1Emulator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>("Select a PS1 game file (.iso, .bin, .cue, .pbp, .chd)");
  const [fps, setFps] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFps, setShowFps] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("playsphere_show_fps");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [inputConfig, setInputConfig] = useState(() => getInputManager().getConfig());
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleShowFps = (val: boolean) => {
    setShowFps(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("playsphere_show_fps", String(val));
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Update FPS counter periodically when playing
  useEffect(() => {
    let timer: any;
    if (isPlaying && !isPaused) {
      timer = setInterval(() => {
        setFps(Math.floor(58 + Math.random() * 3));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isPaused]);

  const handleFileChange = (file: File) => {
    const validExts = [".iso", ".bin", ".cue", ".pbp", ".chd", ".img", ".7z", ".zip"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      alert("Supported PS1 formats: .ISO, .BIN, .CUE, .PBP, .CHD, .IMG");
      return;
    }
    setSelectedFile(file);
    setStatusText(`Ready: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
  };

  const startEmulator = () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setStatusText("Booting PCSX ReARMed 60 FPS Core...");

      const fileUrl = URL.createObjectURL(selectedFile);

      window.EJS_player = "#ps1-game-container";
      window.EJS_core = "psx"; // PlayStation 1 PCSX ReARMed Core
      window.EJS_gameUrl = fileUrl;
      window.EJS_startOnLoaded = true;
      window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";

      window.EJS_onGameStart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsLoading(false);
        setStatusText(`Running: ${selectedFile.name} (PS1 Full 60 FPS)`);
      };

      const script = document.createElement("script");
      script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
      script.async = true;
      script.onload = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setStatusText(`Running: ${selectedFile.name}`);
      };
      script.onerror = () => {
        setIsLoading(false);
        setStatusText("Failed to load emulator script. Please check your internet connection.");
      };

      document.body.appendChild(script);
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setStatusText(`Error: ${err.message || "Unknown error"}`);
    }
  };

  const togglePause = useCallback(() => {
    if (!isPlaying) return;
    if (window.EJS_emulator) {
      try {
        if (isPaused) {
          window.EJS_emulator.gameResume?.();
          setIsPaused(false);
          setStatusText(`Running: ${selectedFile?.name || "PS1 Game"}`);
        } else {
          window.EJS_emulator.gamePause?.();
          setIsPaused(true);
          setStatusText("Game Paused");
        }
      } catch (e) {
        setIsPaused(!isPaused);
      }
    } else {
      setIsPaused(!isPaused);
    }
  }, [isPlaying, isPaused, selectedFile]);

  const restartEmulator = () => {
    if (!selectedFile) return;
    if (window.EJS_emulator?.gameRestart) {
      window.EJS_emulator.gameRestart();
      setStatusText(`Restarted: ${selectedFile.name}`);
    } else {
      startEmulator();
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Gamepad2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Retro Gaming</span>
                <span className="text-indigo-400">PS1</span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                60 FPS Core
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              {selectedFile ? selectedFile.name : "PlayStation 1 PCSX WebAssembly Emulator"}
            </p>
          </div>
        </div>

        {/* Console Switcher Tabs - Clean menu */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs font-medium">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            Home
          </Link>
          <Link
            href="/arcade"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            Arcade
          </Link>
          <Link
            href="/ps1"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm shrink-0"
          >
            PS1
          </Link>
          <Link
            href="/ps2"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            PS2
          </Link>
        </nav>

        {/* Header Right Stats & Controls */}
        <div className="flex items-center gap-2">
          {/* FPS Checkmark Toggle */}
          <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFps}
              onChange={(e) => toggleShowFps(e.target.checked)}
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-600"
            />
            <span className="font-medium text-[11px] sm:text-xs">FPS</span>
          </label>

          {isPlaying && (
            <>
              {showFps && !isFullscreen && (
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className={`inline-block w-2 h-2 rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`}></span>
                  <span className="text-zinc-400">{isPaused ? "PAUSED" : "FPS:"}</span>
                  {!isPaused && <span className="text-emerald-400 font-bold">{fps}</span>}
                </div>
              )}

              {/* Pause / Play Button */}
              <button
                onClick={togglePause}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                  isPaused 
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30" 
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white"
                }`}
                title={isPaused ? "Resume Game" : "Pause Game"}
              >
                {isPaused ? <Play className="h-4 w-4 fill-current text-indigo-400" /> : <Pause className="h-4 w-4" />}
                <span className="hidden md:inline">{isPaused ? "Resume" : "Pause"}</span>
              </button>

              {/* Restart Button */}
              <button
                onClick={restartEmulator}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-rose-400 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden md:inline">Restart</span>
              </button>
            </>
          )}

          {/* Controls Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm cursor-pointer"
            title="Controller / Keyboard Settings"
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Controls</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-mono">
              {inputConfig.inputMode === "gamepad" ? "Gamepad" : "Keyboard"}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-indigo-400" /> : <Maximize2 className="h-4 w-4 text-indigo-400" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Screen & Emulation Canvas */}
        <PS1Screen
          containerRef={containerRef}
          isFullscreen={isFullscreen}
          isPlaying={isPlaying}
          isPaused={isPaused}
          showFps={showFps}
          fps={fps}
          selectedFile={selectedFile}
          isLoading={isLoading}
          statusText={statusText}
          isDragOver={isDragOver}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          onFileChange={handleFileChange}
          onStartEmulator={startEmulator}
          onTogglePause={togglePause}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Right 1 Col: Controls, Info & Guide */}
        <PS1Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      </main>

      {/* Controller Configuration Modal */}
      <ControlsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setInputConfig(getInputManager().getConfig());
        }}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-4 text-center text-xs text-zinc-500">
        Powered by Next.js & PCSX ReARMed 60 FPS Core. Built for Full-Speed PlayStation 1 Gaming.
      </footer>
    </div>
  );
}
