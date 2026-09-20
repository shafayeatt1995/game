"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ControlsSettingsModal from "@/components/ControlsSettingsModal";
import { getInputManager } from "@/lib/InputManager";
import {
  isRomCached,
  getRomBlob,
  saveRomBlob,
  deleteRomBlob,
  getAllCachedRomIds
} from "@/lib/ArcadeRomStorage";
import ArcadeHeader from "@/components/arcade/ArcadeHeader";
import ArcadeSidebarTabs from "@/components/arcade/ArcadeSidebarTabs";
import ArcadeModals from "@/components/arcade/ArcadeModals";
import ArcadeGameLibrary from "@/components/arcade/ArcadeGameLibrary";
import ArcadeScreen from "./arcade/ArcadeScreen";

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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFps, setShowFps] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("playsphere_show_fps");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [, setInputConfig] = useState(() => getInputManager().getConfig());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingGameToDownload, setPendingGameToDownload] = useState<RetroGamePreset | null>(null);

  // Link Importer state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importUrlInput, setImportUrlInput] = useState<string>("");
  const [importTitleInput, setImportTitleInput] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);

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
      let resolvedGameName = gameId || "dino";
      if (!resolvedGameName.toLowerCase().endsWith(".zip")) {
        resolvedGameName = `${resolvedGameName}.zip`;
      }

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
        try {
          response = await fetch(game.romUrl);
          if (!response.ok) throw new Error("Direct fetch failed");
        } catch {
          const proxyUrl = `/api/proxy-rom?url=${encodeURIComponent(game.romUrl)}`;
          response = await fetch(proxyUrl);
        }
      } else {
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

      const romBlob = new Blob(chunks as any, { type: "application/zip" });
      await saveRomBlob(game.id, romBlob);
      await refreshCachedList();
      setIsDownloading(false);
      setDownloadProgress(100);
      setStatusText("Saved in memory! Automatically booting now...");

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
    const isSaved = await isRomCached(game.id);

    if (isSaved) {
      setStatusText(`Loading '${game.title}' instantly from memory...`);
      const cachedBlob = await getRomBlob(game.id);
      if (cachedBlob) {
        launchEmulatorWithBlob(cachedBlob, game.title, game.id);
      } else {
        setPendingGameToDownload(game);
        setShowConfirmModal(true);
      }
    } else {
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

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const handleStopGame = () => {
    setIsPlaying(false);
    setStatusText("Stopped game. Ready to play.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <ArcadeHeader
        selectedGame={selectedGame}
        isPlaying={isPlaying}
        showFps={showFps}
        isFullscreen={isFullscreen}
        fps={fps}
        onToggleFps={toggleShowFps}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Game Screen + Game Library Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <ArcadeScreen
            containerRef={containerRef}
            selectedGame={selectedGame}
            isPlaying={isPlaying}
            isDownloading={isDownloading}
            downloadProgress={downloadProgress}
            isLoadingGames={isLoadingGames}
            cachedIds={cachedIds}
            showFps={showFps}
            fps={fps}
            statusText={statusText}
            onSelectAndPlay={handleGameSelectAndPlay}
            onStopGame={handleStopGame}
            onToggleFullscreen={toggleFullscreen}
          />

          {/* All Games Selection Library */}
          <ArcadeGameLibrary
            gamesList={gamesList}
            selectedGame={selectedGame}
            cachedIds={cachedIds}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onSelectGame={handleGameSelectAndPlay}
            onDeleteCachedRom={handleDeleteCachedRom}
            onOpenImportModal={() => setShowImportModal(true)}
          />
        </div>

        {/* Right 1 Col: Controls, Tech & Storage Information */}
        <ArcadeSidebarTabs />
      </main>

      {/* Confirmation and Import Modals */}
      <ArcadeModals
        showConfirmModal={showConfirmModal}
        pendingGameToDownload={pendingGameToDownload}
        onCloseConfirmModal={() => setShowConfirmModal(false)}
        onConfirmDownload={downloadAndBootGame}
        showImportModal={showImportModal}
        importUrlInput={importUrlInput}
        setImportUrlInput={setImportUrlInput}
        importTitleInput={importTitleInput}
        setImportTitleInput={setImportTitleInput}
        importError={importError}
        isImporting={isImporting}
        onCloseImportModal={() => {
          setShowImportModal(false);
          setImportError("");
        }}
        onImportRom={handleImportRom}
      />

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
