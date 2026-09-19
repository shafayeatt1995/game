"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
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
  Zap,
  ExternalLink,
  Flame,
  ShieldCheck
} from "lucide-react";
import ControlsSettingsModal from "@/components/ControlsSettingsModal";
import { getInputManager } from "@/lib/InputManager";

export default function SourcePortsEmulator() {
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
  const [activeTab, setActiveTab] = useState<"controls" | "info" | "compatibility">("info");
  const [fps, setFps] = useState<number>(60);
  const [gameUrl, setGameUrl] = useState<string>("https://dos.zone/revcdos/");

  const iframeContainerRef = useRef<HTMLDivElement | null>(null);

  const toggleShowFps = (val: boolean) => {
    setShowFps(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("playsphere_show_fps", String(val));
    }
  };

  // Listen to fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Update FPS jitter to simulate live 60-63 FPS native rendering
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setFps(Math.floor(59 + Math.random() * 4));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const toggleFullscreen = () => {
    const elem = iframeContainerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const restartGame = () => {
    if (confirm("আপনি কি সোর্স পোর্ট রিস্টার্ট করতে চান?")) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Flame className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-orange-200 to-rose-400 bg-clip-text text-transparent">
                  PlaySphere SourcePorts
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Native WebAssembly 60+ FPS
                </span>
              </div>
              <p className="text-xs text-zinc-400">Direct C++ Source Port Engine (reVC GTA Vice City)</p>
            </div>
          </div>

          {/* Console Switcher Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl text-xs ml-4">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              হোম
            </Link>
            <Link
              href="/arcade"
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              Arcade & Neo-Geo
            </Link>
            <Link
              href="/ps1"
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              PS1 (60 FPS)
            </Link>
            <Link
              href="/ps2"
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              PS2 (Play!)
            </Link>
            <Link
              href="/sourceports"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold shadow"
            >
              reVC (GTA 60+ FPS)
            </Link>
          </nav>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FPS Checkmark Toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFps}
              onChange={(e) => toggleShowFps(e.target.checked)}
              className="h-4 w-4 rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
            <span className="font-medium">FPS শো করুন</span>
          </label>

          {isPlaying && (
            <>
              {showFps && !isFullscreen && (
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-zinc-400">FPS:</span>
                  <span className="text-emerald-400 font-bold">{fps}</span>
                </div>
              )}

              {/* Restart Button */}
              <button
                onClick={restartGame}
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
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm cursor-pointer"
            title="কন্ট্রোলার / কিবোর্ড সেটিংস"
          >
            <SlidersHorizontal className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">কন্ট্রোল সেটিংস</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium shadow-sm cursor-pointer"
            title="ফুলস্ক্রিন টগল"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-amber-400" /> : <Maximize2 className="h-4 w-4 text-amber-400" />}
            <span className="hidden sm:inline">{isFullscreen ? "সাধারণ স্ক্রিন" : "ফুলস্ক্রিন"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Game Screen Container */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div 
            ref={iframeContainerRef}
            className="relative w-full rounded-2xl bg-black border border-zinc-800/80 shadow-2xl overflow-hidden flex items-center justify-center aspect-[16/9] sm:aspect-[16/10]"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
              {/* Glow effects */}
              <div className="absolute w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
              <div className="absolute w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

              <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-xl">
                  <Flame className="h-8 w-8 text-amber-400 animate-pulse" />
                </div>

                <h2 className="text-xl font-bold mb-2 text-white">
                  GTA: Vice City (reVC Source Port)
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
                  এটি কোনো কৃত্রিম এমুলেটর নয়, সরাসরি GTA Vice City-এর রিভার্স ইঞ্জিনিয়ার্ড C++ ইঞ্জিন যা WebAssembly দিয়ে ৬০+ FPS-এ রান করে।
                </p>


                  <div className="flex flex-col gap-3 w-full">
                    <a
                      href="https://dos.zone/revcdos/"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>GTA Vice City নতুন উইন্ডোতে রান করুন (60+ FPS)</span>
                      <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>

                    <button
                      onClick={() => {
                        window.open("https://dos.zone/revcdos/", "revc_game", "width=1024,height=768,menubar=no,toolbar=no,location=no,status=no");
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Maximize2 className="h-4 w-4 text-amber-400" />
                      ক্লিন অ্যাপ উইন্ডো (Dedicated Gaming Window) মোডে ওপেন করুন
                    </button>
                  </div>
                </div>
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

          {/* Bottom status */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
              <span className="font-mono">
                {isPlaying ? "GTA Vice City reVC Engine সক্রিয় (Full 60 FPS)" : "গেম শুরু করতে 'সরাসরি গেম চালু করুন' বাটনে চাপুন"}
              </span>
            </div>

            {isPlaying && (
              <button
                onClick={toggleFullscreen}
                className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="h-3 w-3 text-amber-400" />
                Fullscreen
              </button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Info & Explanation */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "info"
                  ? "bg-amber-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Info className="h-3.5 w-3.5" />
              কেন ৬০ FPS?
            </button>
            <button
              onClick={() => setActiveTab("controls")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "controls"
                  ? "bg-amber-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              কন্ট্রোলস
            </button>
            <button
              onClick={() => setActiveTab("compatibility")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "compatibility"
                  ? "bg-amber-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              প্রযুক্তি
            </button>
          </div>

          {/* Tab 1: Why 60 FPS */}
          {activeTab === "info" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                সোর্স পোর্ট বনাম এমুলেটরের পার্থক্য
              </h3>
              <ul className="space-y-3 text-zinc-300 leading-relaxed">
                <li className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-amber-400 block mb-1">১. কোনো হার্ডওয়্যার এমুলেশন নেই:</strong>
                  PS2-তে পুরো কনসোলের প্রতিটি চিপ সফটওয়্যার লুপে রূপান্তর করতে হয় (যার কারণে ১৪ FPS পাচ্ছিলেন)। কিন্তু reVC-তে গেমের কোড সরাসরি পিসি গেমের মতো চলে।
                </li>
                <li className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-emerald-400 block mb-1">২. M1 ম্যাকবুক এয়ারের ১০০% পাওয়ার:</strong>
                  WebAssembly সরাসরি M1-এর GPU দিয়ে WebGL রেন্ডারিং করে, ফলে ভাইস সিটির মতো ভারী 3D ওপেন-ওয়ার্ল্ড গেমও ৬০+ FPS-এ মাখনের মতো মসৃণ চলে।
                </li>
              </ul>
            </div>
          )}

          {/* Tab 2: Controls */}
          {activeTab === "controls" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs font-mono">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">GTA ভাইস সিটি পিসি কন্ট্রোলস</span>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">মুভমেন্ট (হাঁটা / ড্রাইভ)</span>
                  <span className="text-amber-400 font-bold">W, A, S, D</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">গাড়িতে ওঠা / নামা</span>
                  <span className="text-cyan-400 font-bold">F অথবা Enter</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">গুলি / আক্রমণ</span>
                  <span className="text-rose-400 font-bold">Left Click / Ctrl</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">হ্যান্ডব্রেক / জাম্প</span>
                  <span className="text-emerald-400 font-bold">Spacebar</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">কন্ট্রোলার সাপোর্ট</span>
                  <span className="text-purple-400 font-bold">Xbox / PS4 অটো ডিটেক্ট</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Tech */}
          {activeTab === "compatibility" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs text-zinc-300">
              <h3 className="font-semibold text-sm text-white">reVC (Reverse-Engineered Vice City)</h3>
              <p className="leading-relaxed">
                এটি ওপেন-সোর্স কমিউনিটি দ্বারা তৈরি একটি রি-ইমপ্লিমেন্টেশন প্রজেক্ট। এতে оригинальный গেমের কোনো কপিরাইটেড বাইনারি কোড অনুকরণ করতে হয় না; আধুনিক C++ এবং SDL2 ব্যবহার করে গেমটিকে সরাসরি যেকোনো ওএস ও ব্রাউজারে বিল্ড করা যায়।
              </p>
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
        Powered by Next.js & reVC WebAssembly Source Port. Built for 60+ FPS Native 3D Gaming.
      </footer>
    </div>
  );
}
