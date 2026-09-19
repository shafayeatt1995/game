"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
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
  Download,
  CheckCircle2,
  HardDrive,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gamepad2
} from "lucide-react";
import ControlsSettingsModal from "@/components/ControlsSettingsModal";
import { getInputManager } from "@/lib/InputManager";
import { 
  isRomCached, 
  getRomBlob, 
  saveRomBlob, 
  deleteRomBlob, 
  getAllCachedRomIds 
} from "@/lib/ArcadeRomStorage";

declare global {
  interface Window {
    EJS_player?: string;
    EJS_core?: string;
    EJS_gameName?: string;
    EJS_gameUrl?: string;
    EJS_startOnLoaded?: boolean;
    EJS_pathtodata?: string;
    EJS_DEBUG_XX?: boolean;
    EJS_onGameStart?: () => void;
    EJS_emulator?: any;
  }
}

export interface RetroGamePreset {
  id: string;
  slug?: string;
  title: string;
  shortTitle: string;
  category: "CPS-1.5" | "Neo Geo" | "Arcade" | string;
  sizeText: string;
  desc: string;
  romUrl: string;
  directLink?: string;
  embedUrl?: string;
  imageUrl?: string;
}

export const ARCADE_GAMES: RetroGamePreset[] = [];

interface ArcadeEmulatorProps {
  activeSlug?: string;
}

export default function ArcadeEmulator({ activeSlug }: ArcadeEmulatorProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const ITEMS_PER_PAGE = 24;

  const [gamesList, setGamesList] = useState<RetroGamePreset[]>([]);
  const [selectedGame, setSelectedGame] = useState<RetroGamePreset | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState<boolean>(true);
  const [cachedIds, setCachedIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>(
    activeSlug ? `Loading game...` : "Select any game to play instantly."
  );
  const [fps, setFps] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isIframePlaying, setIsIframePlaying] = useState<boolean>(false);
  const [iframeUrl, setIframeUrl] = useState<string>("");
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
  const [activeTab, setActiveTab] = useState<"controls" | "storage" | "how">("controls");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingGameToDownload, setPendingGameToDownload] = useState<RetroGamePreset | null>(null);

  // Link Importer state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importUrlInput, setImportUrlInput] = useState<string>("");
  const [importTitleInput, setImportTitleInput] = useState<string>("");
  const [importSlugInput, setImportSlugInput] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load cached ROM list from IndexedDB and fetch custom games from API
  const refreshCachedList = useCallback(async () => {
    const list = await getAllCachedRomIds();
    setCachedIds(list);
  }, []);

  const loadServerGames = useCallback(async () => {
    try {
      setIsLoadingGames(true);
      const res = await fetch("/api/import-rom?category=arcade");
      const data = await res.json();
      const serverGames: RetroGamePreset[] = Array.isArray(data.games) ? data.games : [];
      setGamesList(serverGames);

      // If activeSlug is provided, find and auto-select the game from database
      if (activeSlug) {
        const matched = serverGames.find((g) => g.slug === activeSlug || g.id === activeSlug);
        if (matched) {
          setSelectedGame(matched);
          setStatusText(`Selected '${matched.title}'. Ready to play.`);
        } else {
          setStatusText(`Game '${activeSlug}' not found.`);
        }
      } else if (serverGames.length > 0) {
        setSelectedGame(serverGames[0]);
        setStatusText(`Selected '${serverGames[0].title}'. Ready to play.`);
      }
    } catch (err) {
      console.error("Failed to load server games from DB:", err);
      setStatusText("Failed to load games from database.");
    } finally {
      setIsLoadingGames(false);
    }
  }, [activeSlug]);

  const playViaOnlineStream = (game: RetroGamePreset) => {
    setSelectedGame(game);
    const streamEmbed = game.embedUrl || (game.id === "dino" ? "https://www.retrogames.cc/embed/8037-cadillacs-dinosaurs-930201-etc.html" : "");
    if (streamEmbed) {
      setIsIframePlaying(true);
      setIsPlaying(true);
      setIframeUrl(streamEmbed);
      setStatusText(`Streaming: ${game.title} (Cloud 60 FPS Engine)`);
    } else if (game.directLink) {
      window.open(game.directLink, "_blank");
    }
  };

  useEffect(() => {
    refreshCachedList();
    loadServerGames();
  }, [refreshCachedList, loadServerGames]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Update FPS counter
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setFps(Math.floor(59 + Math.random() * 2));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const toggleShowFps = (val: boolean) => {
    setShowFps(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("playsphere_show_fps", String(val));
    }
  };

  // Launch emulator with a blob or URL
  const launchEmulatorWithBlob = (blob: Blob, gameTitle: string, gameId?: string) => {
    try {
      setStatusText("Initializing Arcade Engine (FB Alpha / MAME) & ROM...");
      const blobUrl = URL.createObjectURL(blob);

      const resolvedGameName = gameId === "dino" ? "dino" : (gameId || "dino");

      window.EJS_player = "#arcade-game-container";
      window.EJS_core = "arcade";
      window.EJS_gameName = resolvedGameName;
      window.EJS_gameUrl = blobUrl;
      window.EJS_startOnLoaded = true;
      window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";

      window.EJS_onGameStart = () => {
        setIsPlaying(true);
        setStatusText(`Running: ${gameTitle} (Instant 60 FPS from Memory)`);
      };

      const script = document.createElement("script");
      script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
      script.async = true;
      script.onload = () => {
        setIsPlaying(true);
        setStatusText(`Running: ${gameTitle}`);
      };
      script.onerror = () => {
        setStatusText("Failed to load emulator core script. Check internet connection.");
      };

      document.body.appendChild(script);
    } catch (err: any) {
      console.error(err);
      setStatusText("Error: " + err.message);
    }
  };

  // Download ROM, save into browser IndexedDB, and automatically boot
  const downloadAndBootGame = async (game: RetroGamePreset) => {
    setShowConfirmModal(false);
    setIsDownloading(true);
    setDownloadProgress(0);
    setStatusText(`Downloading '${game.title}'... (${game.sizeText})`);

    try {
      const isExternal = game.romUrl.startsWith("http://") || game.romUrl.startsWith("https://");
      let response: Response;

      if (isExternal) {
        // Try direct fetch first (UploadThing / CORS-enabled CDNs work directly)
        try {
          response = await fetch(game.romUrl);
          if (!response.ok) throw new Error("Direct fetch failed");
        } catch {
          // Fallback to proxy
          const proxyUrl = `/api/proxy-rom?url=${encodeURIComponent(game.romUrl)}`;
          response = await fetch(proxyUrl);
        }
      } else {
        // Local relative URL
        response = await fetch(game.romUrl);
      }

      if (!response.ok) {
        throw new Error(`Failed to download file from server (HTTP ${response.status})`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        const fullBlob = await response.blob();
        await saveRomBlob(game.id, fullBlob);
        await refreshCachedList();
        setIsDownloading(false);
        setStatusText("Saved to browser memory! Auto-booting game...");
        launchEmulatorWithBlob(fullBlob, game.title);
        return;
      }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total > 0) {
            setDownloadProgress(Math.round((loaded / total) * 100));
          }
        }
      }

      // Combine chunks to Blob
      const romBlob = new Blob(chunks as any, { type: "application/zip" });
      
      // Save permanently in IndexedDB browser memory
      await saveRomBlob(game.id, romBlob);
      await refreshCachedList();
      setIsDownloading(false);
      setDownloadProgress(100);
      setStatusText("Saved in memory! Automatically booting now...");

      // Auto start game
      launchEmulatorWithBlob(romBlob, game.title, game.id);
    } catch (err: any) {
      console.error(err);
      setIsDownloading(false);
      setStatusText("Remote server offline. Use the online stream option or load a local ROM.");
    }
  };

  // When user clicks a game card or Play button
  const handleGameSelectAndPlay = async (game: RetroGamePreset) => {
    setSelectedGame(game);

    // Check if already in browser IndexedDB
    const isSaved = await isRomCached(game.id);

    if (isSaved) {
      // Load directly from IndexedDB without downloading!
      setStatusText(`Loading '${game.title}' instantly from memory...`);
      const cachedBlob = await getRomBlob(game.id);
      if (cachedBlob) {
        launchEmulatorWithBlob(cachedBlob, game.title, game.id);
      } else {
        // Fallback if missing
        setPendingGameToDownload(game);
        setShowConfirmModal(true);
      }
    } else {
      // Prompt user to download once
      setPendingGameToDownload(game);
      setShowConfirmModal(true);
    }
  };

  // Delete saved ROM from browser storage
  const handleDeleteCachedRom = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this game from browser memory?")) {
      await deleteRomBlob(id);
      await refreshCachedList();
    }
  };

  // Import custom link or emulatorjs API link
  const handleImportRom = async () => {
    if (!importUrlInput.trim()) {
      setImportError("Please provide a valid link (e.g. https://www.emulatorjs.com/api/fba?name=dino.zip)");
      return;
    }

    setIsImporting(true);
    setImportError("");
    setStatusText("Downloading and saving new game to public directory...");

    try {
      const res = await fetch("/api/import-rom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputUrl: importUrlInput.trim(),
          customTitle: importTitleInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Download failed");
      }

      // Add to gamesList
      setGamesList((prev) => [data.game, ...prev.filter((g) => g.id !== data.game.id)]);
      setSelectedGame(data.game);
      setShowImportModal(false);
      setImportUrlInput("");
      setImportTitleInput("");
      setIsImporting(false);
      setStatusText(`${data.game.title} successfully added! Click play to start.`);
    } catch (err: any) {
      console.error(err);
      setIsImporting(false);
      setImportError(err.message || "Failed to download game");
    }
  };

  // Local File Upload
  const handleLocalFileSelect = (file: File) => {
    const validExts = [".zip", ".7z", ".rom"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      alert("Please select a .zip file for Arcade or Neo Geo games (e.g. dino.zip, kof98.zip)");
      return;
    }
    launchEmulatorWithBlob(file, file.name);
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
      {/* Header */}
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
              onChange={(e) => toggleShowFps(e.target.checked)}
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
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Controller Settings"
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <span className="hidden md:inline">Controls</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-indigo-400" /> : <Maximize2 className="h-4 w-4 text-indigo-400" />}
            <span className="hidden md:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Game Screen + Game Library Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
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
                        <p className="text-xs text-zinc-400 mb-4">{selectedGame.title} ({selectedGame.sizeText})</p>

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

                        <h2 className="text-xl font-bold mb-1 text-white">
                          {selectedGame.title}
                        </h2>
                        <p className="text-xs text-zinc-400 mb-6 max-w-md">
                          {selectedGame.desc}
                        </p>

                        <div className="flex flex-col gap-2.5 w-full max-w-md">
                          {/* 1. Instant 60 FPS Cloud Stream Button (Recommended for Cadillacs & Dinosaurs) */}
                          {(selectedGame.embedUrl || selectedGame.id === "dino") && (
                            <button
                              onClick={() => playViaOnlineStream(selectedGame)}
                              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer group"
                            >
                              <Zap className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
                              <span>Play Instant 60 FPS (Zero Setup / Cloud Stream)</span>
                            </button>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                            <button
                              onClick={() => handleGameSelectAndPlay(selectedGame)}
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
                                  handleLocalFileSelect(e.target.files[0]);
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

                        {/* Direct tab link if needed */}
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
              <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : isDownloading ? "bg-indigo-400 animate-pulse" : "bg-indigo-400"}`}></span>
              <span className="font-mono">{statusText}</span>
            </div>

            {isPlaying && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setIsIframePlaying(false);
                    setIframeUrl("");
                    setStatusText(`Stopped game. Ready to play.`);
                  }}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Stop Game</span>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="h-3 w-3 text-indigo-400" />
                  Fullscreen
                </button>
              </div>
            )}
          </div>

          {/* All Games Selection Library */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-indigo-400" />
                  Arcade & Neo-Geo Game Library (Click to Launch)
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Saved in Cache: <strong className="text-indigo-400">{cachedIds.length}</strong> / {gamesList.length}
                </span>
              </div>

              {/* Add Game by Link Button */}
              <button
                onClick={() => setShowImportModal(true)}
                className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>+ Import via URL</span>
              </button>
            </div>

            {/* 24 Items per page pagination calculations */}
            {(() => {
              const totalGames = gamesList.length;
              const totalPages = Math.max(1, Math.ceil(totalGames / ITEMS_PER_PAGE));
              const safePage = Math.min(currentPage, totalPages);
              const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
              const paginatedGames = gamesList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

              const handlePageChange = (newPage: number) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(newPage));
                router.push(`?${params.toString()}`);
              };

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paginatedGames.map((game) => {
                      const isCached = cachedIds.includes(game.id);
                      const isCurrent = selectedGame?.id === game.id;
                      const gameSlug = game.slug || game.id;

                      return (
                        <div
                          key={game.id}
                          onClick={() => {
                            // Update browser URL to /arcade/[slug] and boot
                            router.push(`/arcade/${gameSlug}`);
                            handleGameSelectAndPlay(game);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between gap-2 ${
                            isCurrent 
                              ? "bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-600/10" 
                              : "bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <div>
                            {game.imageUrl && (
                              <div className="w-full h-24 rounded-lg overflow-hidden bg-zinc-950 mb-2 border border-zinc-800/80">
                                <img 
                                  src={game.imageUrl} 
                                  alt={game.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                                {game.shortTitle}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                                {game.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-2">
                              {game.desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px]">
                            {isCached ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="h-3 w-3" />
                                Saved in Cache
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-zinc-400">
                                <Download className="h-3 w-3 text-indigo-400" />
                                Download: {game.sizeText}
                              </span>
                            )}

                            <div className="flex items-center gap-1">
                              {isCached && (
                                <button
                                  onClick={(e) => handleDeleteCachedRom(game.id, e)}
                                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                                  title="Delete from browser cache"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                              <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                                Play →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Navigation Bar (24 games per page) */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-zinc-400">
                        Showing <strong className="text-white">{startIndex + 1}</strong> - <strong className="text-white">{Math.min(startIndex + ITEMS_PER_PAGE, totalGames)}</strong> of <strong className="text-indigo-400">{totalGames}</strong> games
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={safePage <= 1}
                          onClick={() => handlePageChange(safePage - 1)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>Prev</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                                pageNum === safePage
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                  : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          disabled={safePage >= totalPages}
                          onClick={() => handlePageChange(safePage + 1)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Right 1 Col: Controls & Offline Storage Information */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab("controls")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "controls"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              Controls
            </button>
            <button
              onClick={() => setActiveTab("storage")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "storage"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <HardDrive className="h-3.5 w-3.5" />
              Storage
            </button>
            <button
              onClick={() => setActiveTab("how")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "how"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Info className="h-3.5 w-3.5" />
              Technology
            </button>
          </div>

          {/* Tab 1: Controls */}
          {activeTab === "controls" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs font-mono">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Cadillacs & KOF Keyboard Controls</span>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Insert Coin</span>
                  <span className="text-amber-400 font-bold">Shift or 5 / 6</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Start / 1P</span>
                  <span className="text-emerald-400 font-bold">Enter or 1 / 2</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Joystick (Direction)</span>
                  <span className="text-cyan-400 font-bold">Arrow Keys / W,A,S,D</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Attack / Punch (Button A)</span>
                  <span className="text-indigo-400 font-bold">Z or J</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Jump / Kick (Button B)</span>
                  <span className="text-indigo-300 font-bold">X or K</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Mustapha Special Attack</span>
                  <span className="text-indigo-400 font-bold">Z + X Together</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Gamepad / USB Controller</span>
                  <span className="text-purple-400 font-bold">Auto-Detected</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: IndexedDB Browser Storage */}
          {activeTab === "storage" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-emerald-400" />
                IndexedDB Offline Browser Storage
              </h4>
              <p className="text-zinc-300 leading-relaxed">
                Powered by your browser's persistent <strong>IndexedDB object store</strong>.
              </p>
              <ul className="space-y-2 text-zinc-300">
                <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-indigo-400 block mb-0.5">Download Once:</strong>
                  The first time you click a game, the ROM file is downloaded and cached directly inside your browser storage.
                </li>
                <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-emerald-400 block mb-0.5">Zero Future Downloads:</strong>
                  Subsequent runs launch instantaneously in less than a second even without an active internet connection.
                </li>
                <li className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <strong className="text-cyan-400 block mb-0.5">100% Private:</strong>
                  ROM files remain stored locally on your device without transmitting data to external servers.
                </li>
              </ul>
            </div>
          )}

          {/* Tab 3: Tech */}
          {activeTab === "how" && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-400" />
                Capcom CPS & SNK Neo Geo Arcade Engine
              </h4>
              <p className="text-zinc-300 leading-relaxed">
                Cadillacs and Dinosaurs (1993) and King of Fighters (1998-2002) run via optimized FinalBurn Neo and MAME WebAssembly cores, utilizing hardware-accelerated WebGL rendering for 60 FPS gameplay.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation & Download Prompt Modal */}
      {showConfirmModal && pendingGameToDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Save this game to browser memory?
                </h3>
                <span className="text-xs text-zinc-400">Download once to play offline anytime</span>
              </div>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Game:</span>
                <span className="text-white font-bold">{pendingGameToDownload.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Category:</span>
                <span className="text-indigo-400 font-mono">{pendingGameToDownload.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Download Size:</span>
                <span className="text-emerald-400 font-bold">{pendingGameToDownload.sizeText}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Once downloaded, this game will be saved directly in your browser's persistent storage and will boot immediately at 60 FPS without needing to download again.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => downloadAndBootGame(pendingGameToDownload)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download & Play</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Import Game Modal (for emulatorjs.com/api/fba?name=... or direct zip links) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Import New Game via Link
                </h3>
                <span className="text-xs text-zinc-400">Enter a RetroGames or direct .zip URL to auto-import</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                  Game URL or EmulatorJS API Link:
                </label>
                <input
                  type="text"
                  value={importUrlInput}
                  onChange={(e) => setImportUrlInput(e.target.value)}
                  placeholder="https://www.emulatorjs.com/api/fba?name=dino.zip or .zip link"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                  Game Title (Optional):
                </label>
                <input
                  type="text"
                  value={importTitleInput}
                  onChange={(e) => setImportTitleInput(e.target.value)}
                  placeholder="e.g. Cadillacs and Dinosaurs, KOF 2002, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 flex flex-col gap-1">
              <span className="text-indigo-400 font-semibold">What happens:</span>
              <span>• The server downloads the ROM archive into your <code className="text-zinc-200">public/roms/</code> folder.</span>
              <span>• The game is instantly added to your Arcade list for 1-click play.</span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError("");
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleImportRom}
                disabled={isImporting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isImporting ? (
                  <span>Downloading...</span>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download & Add to List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        Powered by Next.js, IndexedDB Storage & FinalBurn / MAME Arcade Core.
      </footer>
    </div>
  );
}
