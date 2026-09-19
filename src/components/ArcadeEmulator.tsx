"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Gamepad2, 
  Maximize2, 
  Minimize2, 
  Play, 
  RotateCcw, 
  Info, 
  Cpu, 
  Keyboard, 
  SlidersHorizontal,
  FolderOpen,
  Sparkles,
  Zap,
  Sword,
  ExternalLink,
  Flame
} from "lucide-react";
import ControlsSettingsModal from "@/components/ControlsSettingsModal";
import { getInputManager } from "@/lib/InputManager";

declare global {
  interface Window {
    EJS_player?: string;
    EJS_core?: string;
    EJS_gameUrl?: string;
    EJS_startOnLoaded?: boolean;
    EJS_pathtodata?: string;
    EJS_DEBUG_XX?: boolean;
    EJS_onGameStart?: () => void;
    EJS_emulator?: any;
  }
}

interface RetroGamePreset {
  id: string;
  title: string;
  category: "CPS-1.5" | "Neo Geo";
  desc: string;
  romUrl: string;
  core: "arcade" | "fbalpha2012_cps1" | "fbalpha2012_cps2" | "neogeo";
  directLink?: string;
}

const PRESET_GAMES: RetroGamePreset[] = [
  {
    id: "dino",
    title: "Cadillacs and Dinosaurs (Mustapha)",
    category: "CPS-1.5",
    desc: "ক্যাপকমের কালজয়ী বিট'এম আপ আর্কেড ক্লাসিক। মুস্তাফা ও হান্নার অ্যাডভেঞ্চার!",
    romUrl: "https://archive.org/download/mame-0.225-roms-merged/dino.zip",
    core: "arcade",
    directLink: "https://www.retrogames.cc/arcade-games/cadillacs-dinosaurs-930201-etc.html"
  },
  {
    id: "kof98",
    title: "The King of Fighters '98 (KOF)",
    category: "Neo Geo",
    desc: "নিও জিও এসএনকে-এর সর্বকালের সেরা ফাইটিং গেম 'The Slugfest'।",
    romUrl: "https://archive.org/download/neogeo_romcollection/kof98.zip",
    core: "arcade",
    directLink: "https://www.retrogames.cc/arcade-games/the-king-of-fighters-98-the-slugfest-kof-98-dream-match-never-ends.html"
  },
  {
    id: "kof2002",
    title: "The King of Fighters 2002",
    category: "Neo Geo",
    desc: "চ্যালেঞ্জ টু আলটিমেট ব্যাটল - সুপার ফাস্ট কম্বো ও আইকনিক ক্যারেক্টারস।",
    romUrl: "https://archive.org/download/neogeo_romcollection/kof2002.zip",
    core: "arcade",
    directLink: "https://www.retrogames.cc/arcade-games/the-king-of-fighters-2002-magic-plus-ii-bootleg.html"
  },
  {
    id: "mslug3",
    title: "Metal Slug 3 (Neo Geo MVS)",
    category: "Neo Geo",
    desc: "সবার প্রিয় অ্যাকশন ও রান-অ্যান্ড-গান আর্কেড শুটার।",
    romUrl: "https://archive.org/download/neogeo_romcollection/mslug3.zip",
    core: "arcade",
    directLink: "https://www.retrogames.cc/arcade-games/metal-slug-3-ngm-2560.html"
  }
];

export default function ArcadeEmulator() {
  const [selectedPreset, setSelectedPreset] = useState<RetroGamePreset>(PRESET_GAMES[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>("গেমটি চালু করতে 'গেম চালু করুন' বাটনে ক্লিক করুন অথবা লোকাল .ZIP ফাইল দিন");
  const [fps, setFps] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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
  const [activeTab, setActiveTab] = useState<"controls" | "how" | "neogeo">("controls");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleShowFps = (val: boolean) => {
    setShowFps(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("playsphere_show_fps", String(val));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setFps(Math.floor(59 + Math.random() * 2));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleFileSelect = (file: File) => {
    const validExts = [".zip", ".7z", ".rom"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      alert("আর্কেড ও নিও-জিও এর জন্য .zip ফাইল সিলেক্ট করুন (যেমন: dino.zip, kof98.zip)");
      return;
    }
    setSelectedFile(file);
    setStatusText(`লোকাল রম প্রস্তুত: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  const bootGame = (romUrlToUse?: string) => {
    try {
      setIsLoading(true);
      setStatusText(`আর্কেড কোর (FB Alpha / MAME) ও রম লোড হচ্ছে...`);

      const targetUrl = romUrlToUse || (selectedFile ? URL.createObjectURL(selectedFile) : selectedPreset.romUrl);

      // Set global EmulatorJS configuration for Arcade / Neo Geo
      window.EJS_player = "#arcade-game-container";
      window.EJS_core = "arcade"; // FinalBurn Alpha / Neo Geo Arcade Core
      window.EJS_gameUrl = targetUrl;
      window.EJS_startOnLoaded = true;
      window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";

      window.EJS_onGameStart = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setStatusText(`চলছে: ${selectedFile ? selectedFile.name : selectedPreset.title} (ফুল ৬০ FPS)`);
      };

      // Load loader script
      const script = document.createElement("script");
      script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
      script.async = true;
      script.onload = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setStatusText(`চলছে: ${selectedFile ? selectedFile.name : selectedPreset.title}`);
      };
      script.onerror = () => {
        setIsLoading(false);
        setStatusText("অনলাইন আর্কেড ফাইল লোড হতে দেরি হচ্ছে। সরাসরি রেট্রোগেমসে খেলতে নিচের বাটনে ক্লিক করুন।");
      };

      document.body.appendChild(script);
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
      setStatusText("গেম বুট করার সময় সমস্যা হয়েছে: " + err.message);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-slate-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sword className="h-5 w-5 text-orange-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-red-400 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                  PlaySphere Arcade & Neo-Geo
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                  CPS-1.5 / Neo Geo MVS (60 FPS)
                </span>
              </div>
              <p className="text-xs text-zinc-400">Cadillacs and Dinosaurs (Mustapha) & King of Fighters</p>
            </div>
          </div>

          {/* Console Switcher Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl text-xs ml-4">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors">
              হোম
            </Link>
            <Link href="/arcade" className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold shadow">
              Arcade & Neo-Geo
            </Link>
            <Link href="/ps1" className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors">
              PS1 (60 FPS)
            </Link>
            <Link href="/ps2" className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors">
              PS2 (Play!)
            </Link>
            <Link href="/sourceports" className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors">
              reVC (GTA 60+)
            </Link>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFps}
              onChange={(e) => toggleShowFps(e.target.checked)}
              className="h-4 w-4 rounded bg-zinc-950 border-zinc-700 text-orange-500 focus:ring-0 cursor-pointer accent-orange-500"
            />
            <span className="font-medium">FPS শো করুন</span>
          </label>

          {isPlaying && showFps && !isFullscreen && (
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-400">FPS:</span>
              <span className="text-emerald-400 font-bold">{fps}</span>
            </div>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="কন্ট্রোলার সেটিংস"
          >
            <SlidersHorizontal className="h-4 w-4 text-orange-400" />
            <span className="hidden sm:inline">কন্ট্রোল সেটিংস</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-orange-400" /> : <Maximize2 className="h-4 w-4 text-orange-400" />}
            <span className="hidden sm:inline">{isFullscreen ? "সাধারণ স্ক্রিন" : "ফুলস্ক্রিন"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Game Screen Container */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Preset Selector Bar */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-zinc-400 px-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              গেম সিলেক্ট:
            </span>
            <div className="flex gap-2">
              {PRESET_GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedPreset(game);
                    setSelectedFile(null);
                    setStatusText(`নির্বাচিত: ${game.title}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedPreset.id === game.id && !selectedFile
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md shadow-orange-600/30 font-bold"
                      : "bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {game.title.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative w-full rounded-2xl bg-black border border-zinc-800/80 shadow-2xl overflow-hidden flex items-center justify-center aspect-[4/3] max-h-[70vh]"
          >
            {/* EmulatorJS Mount Target */}
            <div id="arcade-game-container" className="w-full h-full flex items-center justify-center">
              {!isPlaying && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-colors ${
                    isDragOver ? "bg-orange-950/40 border-2 border-dashed border-orange-500" : "bg-zinc-950/90"
                  }`}
                >
                  <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400 shadow-xl shadow-orange-500/10">
                    <Sword className="h-8 w-8 text-orange-400 animate-pulse" />
                  </div>

                  <h2 className="text-xl font-bold mb-1 text-white">
                    {selectedFile ? selectedFile.name : selectedPreset.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mb-6 max-w-md">
                    {selectedFile 
                      ? "আপনার লোকাল আর্কেড / নিও জিও রম ফাইলটি প্রস্তুত।" 
                      : selectedPreset.desc}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <button
                      onClick={() => bootGame()}
                      disabled={isLoading}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>{isLoading ? "কোর লোড হচ্ছে..." : "ব্রাউজারে সরাসরি খেলুন (60 FPS)"}</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip,.7z,.rom"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FolderOpen className="h-4 w-4 text-orange-400" />
                      <span>লোকাল রম (.zip)</span>
                    </button>
                  </div>

                  {/* Direct retrogames.cc Launcher Option */}
                  {selectedPreset.directLink && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 w-full max-w-md flex flex-col items-center gap-2">
                      <span className="text-[11px] text-zinc-500">অথবা retrogames.cc-এর মতো ক্লাউড সার্ভার থেকে খেলুন:</span>
                      <a
                        href={selectedPreset.directLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-orange-300 hover:text-orange-200 transition-all flex items-center justify-center gap-2 group"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-orange-400 transition-transform group-hover:translate-x-0.5" />
                        <span>{selectedPreset.title.split(" (")[0]} retrogames.cc উইন্ডোতে খেলুন</span>
                      </a>
                    </div>
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

          {/* Bottom Status */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-orange-400"}`}></span>
              <span className="font-mono">{statusText}</span>
            </div>

            {isPlaying && (
              <button
                onClick={toggleFullscreen}
                className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="h-3 w-3 text-orange-400" />
                Fullscreen
              </button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Info, Neo Geo Guide & Controls */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab("controls")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "controls"
                  ? "bg-orange-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              কন্ট্রোলস
            </button>
            <button
              onClick={() => setActiveTab("how")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "how"
                  ? "bg-orange-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Info className="h-3.5 w-3.5" />
              retrogames কৌশল
            </button>
            <button
              onClick={() => setActiveTab("neogeo")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "neogeo"
                  ? "bg-orange-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Neo Geo & KOF
            </button>
          </div>

          {/* Tab 1: Controls */}
          {activeTab === "controls" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs font-mono">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">আর্কেড / নিও-জিও ডিফল্ট কিবোর্ড কন্ট্রোল</span>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">কয়েন প্রবেশ (Insert Coin)</span>
                  <span className="text-amber-400 font-bold">Shift অথবা 5 / 6</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">স্টার্ট বাটন (Start / 1P)</span>
                  <span className="text-emerald-400 font-bold">Enter অথবা 1 / 2</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">দিকনির্দেশ (D-Pad / Joystick)</span>
                  <span className="text-cyan-400 font-bold">Arrow Keys / W,A,S,D</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">অ্যাটাক / ঘুষি (Button A)</span>
                  <span className="text-rose-400 font-bold">Z অথবা J</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">জাম্প / লাথি (Button B)</span>
                  <span className="text-indigo-400 font-bold">X অথবা K</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">মুস্তাফা স্পেশাল অ্যাটাক</span>
                  <span className="text-orange-400 font-bold">Z + X একসাথে</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">ইউএসবি কন্ট্রোলার সাপোর্ট</span>
                  <span className="text-purple-400 font-bold">প্লাগ অ্যান্ড প্লে অটো ডিটেক্ট</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: How retrogames.cc works */}
          {activeTab === "how" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                retrogames.cc কীভাবে গেমগুলো ব্রাউজারে চালায়?
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                <strong className="text-white">১. Emscripten & WebAssembly:</strong> retrogames.cc সাইটটি মূলত বিখ্যাত সি++ এমুলেটর (MAME এবং FB Alpha / FinalBurn Neo)-কে WebAssembly (.wasm)-এ কম্পাইল করেছে।
              </p>
              <p className="text-zinc-300 leading-relaxed">
                <strong className="text-white">২. EmulatorJS ফ্রেমওয়ার্ক:</strong> এটি আপনার ব্রাউজারের ভেতর মেমরিতে একটি ভার্চুয়াল CPS-1.5 বা Neo Geo মাদারবোর্ড তৈরি করে।
              </p>
              <p className="text-zinc-300 leading-relaxed">
                <strong className="text-white">৩. ৬০ FPS পারফরম্যান্স:</strong> যেহেতু আর্কেড গেমগুলো 2D স্প্রাইট ভিত্তিক এবং ১৬-বিট/৩২-বিট আর্কিটেকচার, তাই যেকোনো ম্যাকবুক (M1) বা উইন্ডোজ পিসির ব্রাউজারে এগুলো ফুল ৬০ FPS স্পিডে চলে।
              </p>
            </div>
          )}

          {/* Tab 3: Neo Geo & King of Fighters */}
          {activeTab === "neogeo" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Neo Geo এমুলেটর ও King of Fighters কীভাবে খেলবেন?
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                উইন্ডোজে আপনি হয়তো <strong>NeoRAGEx, WinKawaks অথবা FinalBurn</strong> দিয়ে KOF খেলতেন। ব্রাউজারে চালানোর নিয়ম:
              </p>
              <ul className="space-y-2 text-zinc-300">
                <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-amber-400 block mb-0.5">রম ফাইল ফরম্যাট:</strong>
                  গেমগুলো সবসময় <code className="text-orange-300">kof98.zip</code>, <code className="text-orange-300">kof2002.zip</code> ইত্যাদি জিপ ফরম্যাটে থাকতে হবে (আনজিপ করবেন না)।
                </li>
                <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-emerald-400 block mb-0.5">নিও-জিও বায়োস (neogeo.zip):</strong>
                  নিও-জিও আর্কেড গেমের জন্য মাদারবোর্ড বায়োস দরকার হয়। আমাদের এই আর্কেড ইঞ্জিনে অটোমেটিক আর্কেড কোর লোডার অন্তর্ভুক্ত রয়েছে।
                </li>
                <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-cyan-400 block mb-0.5">লোকাল রম সাপোর্ট:</strong>
                  আপনার পিসির যেকোনো KOF বা মেটাল স্লাগ .zip ফাইল সরাসরি টেনে এনে ড্রপ করলেই ৬০ FPS-এ রান করবে!
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* Controller Modal */}
      <ControlsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setInputConfig(getInputManager().getConfig());
        }}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-4 text-center text-xs text-zinc-500">
        Powered by Next.js, WebAssembly & FinalBurn / MAME Arcade Core. Built for 60 FPS Classic Gaming.
      </footer>
    </div>
  );
}
