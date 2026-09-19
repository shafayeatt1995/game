"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Gamepad2, 
  Disc, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Info, 
  Cpu, 
  Keyboard, 
  CheckCircle2, 
  AlertTriangle, 
  FolderOpen, 
  Sparkles, 
  SlidersHorizontal,
  Settings2
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

export default function PS2Emulator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>("গেম ফাইল (.iso, .bin, .chd, .cso) সিলেক্ট করুন");
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
  const [activeTab, setActiveTab] = useState<"controls" | "info" | "compatibility">("controls");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const toggleShowFps = (val: boolean) => {
    setShowFps(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("playsphere_show_fps", String(val));
    }
  };



  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenWrapperRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const playModuleRef = useRef<PlayModuleInstance | null>(null);

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
      // Give canvas a frame to adapt
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
      alert("সমর্থিত ফাইল ফরম্যাট: .ISO, .BIN, .CHD, .CSO, .ISZ, .ELF");
      return;
    }
    setSelectedFile(file);
    setStatusText(`প্রস্তুত: ${file.name} (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB)`);
  };

  const startEmulator = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setStatusText("WASM এমুলেটর কোর আরম্ভ করা হচ্ছে...");

      const module = await getPlayModule(canvasRef.current);
      playModuleRef.current = module;

      await bootPS2File(selectedFile, (msg) => {
        setStatusText(msg);
      });

      setIsPlaying(true);
      setIsPaused(false);
      setIsLoading(false);
      setStatusText(`চলছে: ${selectedFile.name}`);

      if (canvasRef.current) {
        getInputManager().setCanvas(canvasRef.current);
        canvasRef.current.focus();
      }
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setStatusText(`সমস্যা হয়েছে: ${err.message || "অজানা ত্রুটি"}`);
    }
  };

  const togglePause = useCallback(() => {
    if (!isPlaying) return;

    if (isPaused) {
      resumeEmulation();
      setIsPaused(false);
      setStatusText(`চলছে: ${selectedFile?.name || "PS2 Game"}`);
      if (canvasRef.current) {
        canvasRef.current.focus();
      }
    } else {
      pauseEmulation();
      setIsPaused(true);
      setStatusText("গেম সাময়িকভাবে পজ (Pause) করা হয়েছে");
    }
  }, [isPlaying, isPaused, selectedFile]);

  const toggleFullscreen = () => {
    const elem = screenWrapperRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const restartEmulator = () => {
    if (confirm("আপনি কি গেমটি রিস্টার্ট বা নতুন ফাইল লোড করতে চান?")) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
                PlaySphere PS2
              </h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                WASM HLE
              </span>
            </div>
            <p className="text-xs text-zinc-400">PlayStation 2 Browser Player with Local ISO Streaming</p>
          </div>
        </div>

        {/* Header Right Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FPS Checkmark Toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFps}
              onChange={(e) => toggleShowFps(e.target.checked)}
              className="h-4 w-4 rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-600"
            />
            <span className="font-medium">FPS শো করুন</span>
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
                    ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30" 
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white"
                }`}
                title={isPaused ? "Resume Game" : "Pause Game"}
              >
                {isPaused ? <Play className="h-4 w-4 fill-current text-emerald-400" /> : <Pause className="h-4 w-4" />}
                <span className="hidden md:inline">{isPaused ? "চালিয়ে যান" : "পজ (Pause)"}</span>
              </button>

              {/* Restart Button */}
              <button
                onClick={restartEmulator}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-rose-400 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="রিস্টার্ট করুন"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden md:inline">রিস্টার্ট</span>
              </button>
            </>
          )}

          {/* Controls Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm cursor-pointer"
            title="কন্ট্রোলার / কিবোর্ড সেটিংস"
          >
            <SlidersHorizontal className="h-4 w-4 text-blue-400" />
            <span className="hidden sm:inline">কন্ট্রোল সেটিংস</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-mono">
              {inputConfig.inputMode === "gamepad" ? "গেমপ্যাড" : "কিবোর্ড"}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm cursor-pointer"
            title="ফুলস্ক্রিন টগল"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-cyan-400" /> : <Maximize2 className="h-4 w-4 text-cyan-400" />}
            <span className="hidden sm:inline">{isFullscreen ? "সাধারণ স্ক্রিন" : "ফুলস্ক্রিন"}</span>
          </button>
        </div>
      </header>


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Screen & Emulation Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Emulation Screen Container (Supports Native Fullscreen) */}
          <div 
            ref={screenWrapperRef}
            className={`relative w-full rounded-2xl bg-black border border-zinc-800/80 shadow-2xl overflow-hidden flex items-center justify-center ${
              isFullscreen ? "fullscreen-active fixed inset-0 z-[9999] h-screen w-screen border-none rounded-none" : "aspect-[4/3]"
            }`}
          >

            {/* The Real WebGL Emscripten Canvas with true 4:3 centering matching official Play! */}
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
                onClick={togglePause}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer transition-all z-30"
              >
                <div className="h-16 w-16 rounded-full bg-blue-600/90 flex items-center justify-center shadow-2xl text-white hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 fill-current ml-1" />
                </div>
                <p className="mt-4 text-base font-semibold text-zinc-200">গেম পজ করা আছে</p>
                <p className="text-xs text-zinc-400 mt-1">চালিয়ে যেতে যেকোনো স্থানে ক্লিক করুন</p>
              </div>
            )}

            {/* In-Game Always-On-Top FPS Display (Always visible in top-right corner, even in fullscreen) */}
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

            {/* In-Screen Floating Quick Action Bar (Visible on hover in Fullscreen or during game) */}
            {isPlaying && (
              <div className="absolute top-4 left-4 opacity-0 hover:opacity-100 transition-opacity z-40 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl px-2 py-1 flex items-center gap-1 shadow-lg">
                <button
                  onClick={togglePause}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play className="h-4 w-4 fill-current text-emerald-400" /> : <Pause className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            )}

            {/* Overlay when game is NOT playing (Game Selector & Drag-Drop) */}
            {!isPlaying && (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all z-20 ${
                  isDragOver ? "bg-blue-950/40 border-2 border-dashed border-blue-500" : "bg-zinc-950"
                }`}
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
              >
                {/* Background Ambient Glow */}
                <div className="absolute w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
                <div className="absolute w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

                <div className="relative z-10 flex flex-col items-center max-w-md">
                  <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 shadow-xl group-hover:scale-105 transition-transform">
                    <Disc className={`h-8 w-8 ${selectedFile ? "text-cyan-400 animate-spin" : "text-blue-400"}`} />
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold mb-2">
                    {selectedFile ? selectedFile.name : "আপনার PS2 গেম নির্বাচন করুন"}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mb-6">
                    {selectedFile 
                      ? `সাইজ: ${(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB • লোকাল ডিস্ক স্ট্রিমিং পদ্ধতির মাধ্যমে দ্রুত লোড হবে`
                      : "আপনার পিসির .ISO, .BIN, বা .CHD ফাইল ড্র্যাগ করে এখানে ফেলুন অথবা ব্রাউজ করুন"}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".iso,.bin,.chd,.cso,.isz,.elf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sm font-medium transition-all flex items-center gap-2 hover:border-zinc-500 shadow-md cursor-pointer"
                    >
                      <FolderOpen className="h-4 w-4 text-blue-400" />
                      ফাইল ব্রাউজ করুন
                    </button>

                    {selectedFile && (
                      <button
                        onClick={startEmulator}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>লোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            <span>গেম শুরু করুন</span>
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
                  ? "bg-blue-400" 
                  : isPaused 
                    ? "bg-amber-400" 
                    : "bg-emerald-400 animate-pulse"
              }`}></span>
              <span className="font-mono truncate">{statusText}</span>
            </div>

            {isPlaying && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={togglePause}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3" />}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  onClick={toggleFullscreen}
                  className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3" />
                  Fullscreen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Controls, Info & Guide */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab("controls")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "controls"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              কন্ট্রোলস
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "info"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Info className="h-3.5 w-3.5" />
              ফিচারসমূহ
            </button>
            <button
              onClick={() => setActiveTab("compatibility")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "compatibility"
                  ? "bg-blue-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              সহায়তা
            </button>
          </div>

          {/* Tab 1: Controls mapping */}
          {activeTab === "controls" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">PS2 বাটন</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">কীবোর্ড কি</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-300">D-Pad (দিকসমূহ)</span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-cyan-400 font-bold">Arrow Keys (↑ ↓ ← →)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-300">বাম অ্যানালগ স্টিক</span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-cyan-400 font-bold">T (Up), G (Down), F (Left), H (Right)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-300">ডান অ্যানালগ স্টিক</span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-cyan-400 font-bold">I, K, J, L</span>
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
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold">1 / 2 / 3</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-300">R1 / R2 / R3</span>
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-indigo-400 font-bold">8 / 9 / 0</span>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
                কীবোর্ড বা গেমপ্যাড কি কাস্টমাইজ করুন
              </button>

              <div className="mt-1 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                <p className="font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  USB/Bluetooth গেমপ্যাড সাপোর্ট
                </p>
                <p className="text-blue-300/80 leading-relaxed">
                  আপনার কম্পিউটারে কোনো PS4/PS5 বা Xbox কন্ট্রোলার সংযুক্ত থাকলে ব্রাউজারের Gamepad API দিয়ে সরাসরি গেম নিয়ন্ত্রণ করা যাবে।
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Info & Features */}
          {activeTab === "info" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
              <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                প্ল্যাটফর্ম আর্কিটেকচার
              </h3>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <div>
                    <strong className="text-white">জিরো সার্ভার আপলোড:</strong> আপনার গেম ফাইল সার্ভারে যাবে না। এটি সম্পূর্ণরূপে আপনার কম্পিউটারের ব্রাউজারে লোকাল স্ট্রিমিংয়ের মাধ্যমে চলবে।
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <div>
                    <strong className="text-white">কোনো BIOS ফাইলের প্রয়োজন নেই:</strong> Play! হাই-লেভেল এমুলেশন (HLE) ব্যবহার করে স্বয়ংক্রিয়ভাবে গেম বুট করে।
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <div>
                    <strong className="text-white">স্কেলিং ও রেশিও অপটিমাইজেশন:</strong> গেমটি অরিজিনাল PS2 4:3 অ্যাসপেক্ট রেশিও বজায় রেখে ফুলস্ক্রিন ও উইন্ডোড মোডে যথাযথভাবে স্কেল হয়।
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
                কম্প্যাটিবিলিটি ও পারফরম্যান্স
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Play! ব্রাউজার পোর্টটি একটি এক্সপেরিমেন্টাল এমুলেটর। এটি দিয়ে অনেক 2D এবং সাধারণ 3D গেম খেলা গেলেও, খুব ভারী গেমগুলোতে ফ্রেমরেট কিছুটা কম হতে পারে।
              </p>
              <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-zinc-400">
                <strong className="text-zinc-200 block mb-1">প্রস্তাবিত টিপস:</strong>
                • ভালো FPS পাওয়ার জন্য Chrome বা Edge ব্রাউজারে Hardware Acceleration অন রাখুন।
                • সম্পূর্ণ স্ক্রিনে খেলার জন্য "ফুলস্ক্রিন" বাটন ব্যবহার করুন।
              </div>
            </div>
          )}
        </div>
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

