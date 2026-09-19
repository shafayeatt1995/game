"use client";

import React from "react";
import { Download, Sparkles, AlertCircle } from "lucide-react";
import { RetroGamePreset } from "@/components/ArcadeEmulator";

interface ArcadeModalsProps {
  showConfirmModal: boolean;
  pendingGameToDownload: RetroGamePreset | null;
  onCloseConfirmModal: () => void;
  onConfirmDownload: (game: RetroGamePreset) => void;

  showImportModal: boolean;
  importUrlInput: string;
  setImportUrlInput: (val: string) => void;
  importTitleInput: string;
  setImportTitleInput: (val: string) => void;
  importError: string;
  isImporting: boolean;
  onCloseImportModal: () => void;
  onImportRom: () => void;
}

export default function ArcadeModals({
  showConfirmModal,
  pendingGameToDownload,
  onCloseConfirmModal,
  onConfirmDownload,
  showImportModal,
  importUrlInput,
  setImportUrlInput,
  importTitleInput,
  setImportTitleInput,
  importError,
  isImporting,
  onCloseImportModal,
  onImportRom,
}: ArcadeModalsProps) {
  return (
    <>
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
                onClick={onCloseConfirmModal}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => onConfirmDownload(pendingGameToDownload)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download & Play</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Import Game Modal */}
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
                onClick={onCloseImportModal}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={onImportRom}
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
    </>
  );
}
