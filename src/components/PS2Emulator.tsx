"use client";

import { SiteHeader } from "@/components/SiteHeader";

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
import { 
  getPlayModule, 
  bootPS2File, 
  pauseEmulation, 
  resumeEmulation, 
  PlayModuleInstance 
} from "@/lib/PlayManager";
import ControlsSettingsModal from "@/components/ControlsSettingsModal";
import { getInputManager } from "@/lib/InputManager";
import PS2Screen from "@/components/ps2/PS2Screen";
import PS2Sidebar from "@/components/ps2/PS2Sidebar";

export default function PS2Emulator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>("Select a PS2 game file (.iso, .bin, .chd, .cso)");
  const [fps, setFps] = useState<number>(0);
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenWrapperRef = useRef<HTMLDivElement | null>(null);
  const playModuleRef = useRef<PlayModuleInstance | null>(null);

  const toggleShowFps = (val: boolean) => {
    setShowFps(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("playsphere_show_fps", String(val));
    }
  };

  // Measure FPS while playing
  useEffect(() => {
    let interval: any;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        if (playModuleRef.current && typeof playModuleRef.current.getFrames === "function") {
          const currentFps = playModuleRef.current.getFrames();
          if (typeof playModuleRef.current.clearStats === "function") {
            playModuleRef.current.clearStats();
          }
          setFps(currentFps);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.focus();
        }
      }, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFileChange = (file: File) => {
    const validExts = [".iso", ".bin", ".chd", ".cso", ".isz", ".elf"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      alert("Supported formats: .ISO, .BIN, .CHD, .CSO, .ISZ, .ELF");
      return;
    }
    setSelectedFile(file);
    setStatusText(`Ready: ${file.name} (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB)`);
  };

  const startEmulator = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setStatusText("Initializing Play! WASM emulator core...");

      const module = await getPlayModule(canvasRef.current);
      playModuleRef.current = module;

      await bootPS2File(selectedFile, (msg) => {
        setStatusText(msg);
      });

      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
      setStatusText(`Running: ${selectedFile.name}`);

      if (canvasRef.current) {
        getInputManager().setCanvas(canvasRef.current);
        canvasRef.current.focus();
      }
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setStatusText(`Error: ${err.message || "Unknown error"}`);
    }
  };

  const togglePause = useCallback(() => {
    if (!isPlaying) return;

    if (isPaused) {
      resumeEmulation();
      setIsPaused(false);
      setStatusText(`Running: ${selectedFile?.name || "PS2 Game"}`);
      if (canvasRef.current) {
        canvasRef.current.focus();
      }
    } else {
      pauseEmulation();
      setIsPaused(true);
      setStatusText("Game Paused");
    }
  }, [isPlaying, isPaused, selectedFile]);

  const restartEmulator = () => {
    if (!selectedFile) return;
    startEmulator();
  };

  const toggleFullscreen = () => {
    const wrapper = screenWrapperRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      wrapper.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <SiteHeader
        title="Retro Gaming PS2"
        subtitle={selectedFile ? selectedFile.name : "PlayStation 2 Client-Side WebAssembly Emulator"}
        badge="Play! WASM"
        rightElements={
          
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFps}
              onChange={(e) => toggleShowFps(e.target.checked)}
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-600"
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
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Controller Remapping"
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <span className="hidden md:inline">Controls</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Fullscreen Toggle"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-indigo-400" /> : <Maximize2 className="h-4 w-4 text-indigo-400" />}
            <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Screen & Emulation Canvas */}
        <PS2Screen
          screenWrapperRef={screenWrapperRef}
          canvasRef={canvasRef}
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
        <PS2Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
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
        Powered by Next.js & Play! (jpd002/Play-) WebAssembly Core. Built for Client-side PS2 Gaming.
      </footer>
    </div>
  );
}
