"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Gamepad2, 
  Search, 
  Sparkles, 
  HardDrive, 
  CheckCircle2, 
  Download, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Zap,
  Flame,
  ArrowRight,
  Filter,
  Play
} from "lucide-react";
import { ARCADE_GAMES, RetroGamePreset } from "@/components/ArcadeEmulator";
import { isRomCached, getAllCachedRomIds, deleteRomBlob } from "@/lib/ArcadeRomStorage";

const ITEMS_PER_PAGE = 24;

export default function ArcadeCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const initialSearch = searchParams.get("search") || "";

  const [gamesList, setGamesList] = useState<RetroGamePreset[]>([]);
  const [cachedIds, setCachedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // Load cached IDs from browser IndexedDB
  const refreshCachedList = useCallback(async () => {
    try {
      const list = await getAllCachedRomIds();
      setCachedIds(list);
    } catch (e) {
      console.error("Failed to load cached ROM IDs", e);
    }
  }, []);

  // Fetch games from database API
  const loadServerGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/import-rom?category=arcade");
      const data = await res.json();
      const serverGames: RetroGamePreset[] = Array.isArray(data.games) ? data.games : [];
      setGamesList(serverGames);
    } catch (err) {
      console.error("Failed to load arcade games list from DB:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCachedList();
    loadServerGames();
  }, [refreshCachedList, loadServerGames]);

  // Handle remove ROM from local browser memory
  const handleDeleteCachedRom = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Remove this game from your local browser offline storage?")) {
      await deleteRomBlob(id);
      await refreshCachedList();
    }
  };

  // Get distinct categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    gamesList.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return ["all", ...Array.from(set)];
  }, [gamesList]);

  // Filter games based on search query and category
  const filteredGames = useMemo(() => {
    return gamesList.filter((game) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.desc && game.desc.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "all" ||
        (game.category && game.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [gamesList, searchQuery, selectedCategory]);

  // Pagination calculation
  const totalGames = filteredGames.length;
  const totalPages = Math.max(1, Math.ceil(totalGames / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/arcade?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/arcade?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10 hover:border-indigo-400 transition-colors">
            <Gamepad2 className="h-5 w-5 text-indigo-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Arcade & Neo-Geo Hub</span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                60 FPS WebAssembly
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Browse all {gamesList.length} classic arcade titles. Click any card to launch and play.
            </p>
          </div>
        </div>

        {/* Navigation Bar */}
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
          <Link href="/admin/arcad" className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 transition-colors shrink-0">
            Admin
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-zinc-800/60 bg-gradient-to-b from-indigo-950/20 via-zinc-950 to-zinc-950 py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Flame className="h-3.5 w-3.5 text-indigo-400" />
              CPS-1.5 & SNK Neo Geo Classics
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Play Classic Arcade Games <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Directly in Browser</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Legendary titles like Cadillacs & Dinosaurs (Mustapha), King of Fighters '98, Metal Slug, and more. 
              Click any game card to open its dedicated page and play at silky smooth 60 FPS with USB Joystick & Gamepad support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3.5 shadow-xl">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 font-medium block">Offline Storage</span>
                <span className="text-sm font-bold text-white">
                  <strong className="text-indigo-400">{cachedIds.length}</strong> Games Saved
                </span>
              </div>
            </div>

            <Link
              href="/admin/arcad"
              className="py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-indigo-300 hover:text-white transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>+ Add New Game</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-2xl">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by game name (Mustapha, KOF, Punisher...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="h-3.5 w-3.5 text-zinc-500 hidden sm:block mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {cat === "all" ? "All Games" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid (24 items per page) */}
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-zinc-400 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
            <span className="text-xs">Loading arcade collection...</span>
          </div>
        ) : paginatedGames.length === 0 ? (
          <div className="min-h-[350px] bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Arcade Games Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              We couldn't find any games matching "{searchQuery}". Try searching another name or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedGames.map((game) => {
                const isCached = cachedIds.includes(game.id);
                const gameSlug = game.slug || game.id;

                return (
                  <Link
                    key={game.id}
                    href={`/arcade/${gameSlug}`}
                    className="group bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/90 hover:border-indigo-500/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                  >
                    <div>
                      {/* Game Cover Image */}
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-zinc-800/80">
                        {game.imageUrl ? (
                          <img
                            src={game.imageUrl}
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-600 gap-2">
                            <Gamepad2 className="h-8 w-8 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500">
                              {game.category || "Arcade"}
                            </span>
                          </div>
                        )}

                        {/* Category badge */}
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-zinc-200 border border-zinc-700/60 font-mono">
                            {game.category || "Arcade"}
                          </span>
                        </div>

                        {/* Cached badge */}
                        {isCached && (
                          <div className="absolute top-2 left-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Cached
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay with Play Button */}
                        <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <div className="h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 group-hover:scale-110 transition-transform">
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Title & Short Title */}
                      <div className="mb-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {game.title}
                        </h3>
                        <span className="text-[11px] text-zinc-400 font-mono block">
                          {game.shortTitle}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                        {game.desc || "Classic retro arcade title running at 60 FPS in browser with instant load."}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        {isCached ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Zap className="h-3 w-3 fill-emerald-400" />
                            Offline Ready
                          </span>
                        ) : (
                          <span>{game.sizeText || "ROM"}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCached && (
                          <button
                            onClick={(e) => handleDeleteCachedRom(game.id, e)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                            title="Delete from browser cache"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Play <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-zinc-400">
                  Showing <strong className="text-white">{startIndex + 1}</strong> - <strong className="text-white">{Math.min(startIndex + ITEMS_PER_PAGE, totalGames)}</strong> of <strong className="text-indigo-400">{totalGames}</strong> arcade games
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={safePage <= 1}
                    onClick={() => handlePageChange(safePage - 1)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          pageNum === safePage
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={safePage >= totalPages}
                    onClick={() => handlePageChange(safePage + 1)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-5 text-center text-xs text-zinc-500 mt-12">
        PlaySphere Web Hub • Arcade & Neo-Geo WebAssembly Emulation • IndexedDB Offline Caching
      </footer>
    </div>
  );
}
