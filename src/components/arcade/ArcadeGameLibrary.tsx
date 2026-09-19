"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HardDrive, Sparkles, CheckCircle2, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { RetroGamePreset } from "@/components/ArcadeEmulator";

interface ArcadeGameLibraryProps {
  gamesList: RetroGamePreset[];
  selectedGame: RetroGamePreset | null;
  cachedIds: string[];
  currentPage: number;
  itemsPerPage: number;
  onSelectGame: (game: RetroGamePreset) => void;
  onDeleteCachedRom: (id: string, e: React.MouseEvent) => void;
  onOpenImportModal: () => void;
}

export default function ArcadeGameLibrary({
  gamesList,
  selectedGame,
  cachedIds,
  currentPage,
  itemsPerPage,
  onSelectGame,
  onDeleteCachedRom,
  onOpenImportModal,
}: ArcadeGameLibraryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalGames = gamesList.length;
  const totalPages = Math.max(1, Math.ceil(totalGames / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedGames = gamesList.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
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
          onClick={onOpenImportModal}
          className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>+ Import via URL</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginatedGames.map((game) => {
          const isCached = cachedIds.includes(game.id);
          const isCurrent = selectedGame?.id === game.id;
          const gameSlug = game.slug || game.id;

          return (
            <div
              key={game.id}
              onClick={() => {
                router.push(`/arcade/${gameSlug}`);
                onSelectGame(game);
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
                      onClick={(e) => onDeleteCachedRom(game.id, e)}
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

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-zinc-400">
            Showing <strong className="text-white">{startIndex + 1}</strong> -{" "}
            <strong className="text-white">{Math.min(startIndex + itemsPerPage, totalGames)}</strong> of{" "}
            <strong className="text-indigo-400">{totalGames}</strong> games
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
    </div>
  );
}
