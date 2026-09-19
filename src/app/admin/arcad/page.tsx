"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Play, 
  HardDrive, 
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  ImageIcon,
  X
} from "lucide-react";
import { CustomGame } from "@/lib/CustomGamesStore";
import { AuthNavButton } from "@/components/AuthNavButton";


export default function AdminPage() {
  const [urlInput, setUrlInput] = useState<string>("");
  const [titleInput, setTitleInput] = useState<string>("");
  const [slugInput, setSlugInput] = useState<string>("");
  const [categoryInput, setCategoryInput] = useState<string>("Arcade");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [importedGames, setImportedGames] = useState<CustomGame[]>([]);
  const [isFetchingList, setIsFetchingList] = useState<boolean>(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Quick preset links user can test
  const quickLinks = [
    {
      name: "Cadillacs & Dinosaurs (Mustapha)",
      url: "https://www.retrogames.cc/arcade-games/cadillacs-dinosaurs-930201-etc.html"
    },
    {
      name: "The King of Fighters '98 (KOF '98)",
      url: "https://www.retrogames.cc/arcade-games/the-king-of-fighters-98-the-slugfest-kof-98-dream-match-never-ends.html"
    },
    {
      name: "The King of Fighters 2002",
      url: "https://www.retrogames.cc/arcade-games/the-king-of-fighters-2002-magic-plus-ii-bootleg.html"
    },
    {
      name: "The Punisher (Capcom)",
      url: "https://www.retrogames.cc/arcade-games/the-punisher-930422-etc.html"
    },
    {
      name: "Metal Slug 3 (Neo Geo)",
      url: "https://www.retrogames.cc/arcade-games/metal-slug-3-ngm-2560.html"
    },
    {
      name: "Street Fighter II' Hyper Fighting",
      url: "https://www.retrogames.cc/arcade-games/street-fighter-ii-hyper-fighting-turbo-921209-etc.html"
    }
  ];

  // Fetch all imported games from /api/import-rom
  const fetchImportedGames = async () => {
    try {
      setIsFetchingList(true);
      const res = await fetch("/api/import-rom");
      const data = await res.json();
      setImportedGames(data.games || []);
    } catch (err) {
      console.error("Failed to load games list:", err);
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    fetchImportedGames();
  }, []);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setErrorMessage("Please enter a valid retrogames.cc or .zip URL");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("inputUrl", urlInput.trim());
      if (titleInput.trim()) {
        formData.append("customTitle", titleInput.trim());
      }
      if (slugInput.trim()) {
        formData.append("customSlug", slugInput.trim());
      }
      formData.append("category", categoryInput);
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }

      const res = await fetch("/api/import-rom", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Download and import failed");
      }

      setSuccessMessage(data.message || "Game successfully downloaded and saved!");
      setUrlInput("");
      setTitleInput("");
      setSlugInput("");
      setImageFile(null);
      setImagePreview("");
      fetchImportedGames();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game from UploadThing & Database?")) return;

    try {
      const res = await fetch(`/api/import-rom?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchImportedGames();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/arcade"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Back to Arcade</span>
          </Link>

          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Arcade & Neo-Geo ROM Importer</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                UploadThing Cloud
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400">Download and import ROMs directly to UploadThing cloud storage and MongoDB Atlas</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 text-xs">
          <Link href="/arcade" className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-colors">
            Play Arcade
          </Link>
          <div className="hidden lg:block">
            <AuthNavButton />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
        
        {/* Importer Card */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Automatic Game Importer from RetroGames.cc</h2>
              <p className="text-xs text-zinc-400">Provide any RetroGames page URL—the server will automatically extract and download the ROM archive</p>
            </div>
          </div>

          <form onSubmit={handleImportSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1.5 flex flex-wrap items-center justify-between gap-1">
                <span>RetroGames.cc Page URL or Direct .zip Link:</span>
                <span className="text-zinc-500 font-normal text-[11px]">e.g. https://www.retrogames.cc/arcade-games/...</span>
              </label>
              <div className="relative">
                <Globe className="h-4 w-4 absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.retrogames.cc/arcade-games/cadillacs-dinosaurs-930201-etc.html"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 flex flex-wrap items-center justify-between gap-1">
                  <span>Custom Game Title:</span>
                  <span className="text-zinc-500 font-normal text-[11px]">Auto if empty</span>
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTitleInput(newTitle);
                    if (!slugInput) {
                      const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                      setSlugInput(autoSlug);
                    }
                  }}
                  placeholder="e.g. Cadillacs & Dinosaurs"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 flex flex-wrap items-center justify-between gap-1">
                  <span>Game Slug:</span>
                  <span className="text-zinc-500 font-normal text-[11px]">URL: /arcade/slug</span>
                </label>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}
                  placeholder="e.g. dino, kof98"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-indigo-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono transition-all"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1.5 flex flex-wrap items-center justify-between gap-1">
                  <span>Category / Platform:</span>
                  <span className="text-zinc-500 font-normal text-[11px]">Console category</span>
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="arcade">Arcade (FB Alpha)</option>
                  <option value="neo geo">Neo Geo (MVS/AES)</option>
                  <option value="cps-1.5">Capcom CPS-1.5</option>
                  <option value="ps1">PlayStation 1 (PS1)</option>
                  <option value="ps2">PlayStation 2 (PS2)</option>
                  <option value="sourceports">GTA / Source Port (reVC)</option>
                </select>
              </div>
            </div>

            {/* Image Upload Input */}
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1.5 block flex items-center justify-between">
                <span>Game Cover Image Upload (Optional):</span>
                <span className="text-zinc-500 font-normal">Select a JPG, PNG, or WebP image</span>
              </label>

              {imagePreview ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="h-16 w-24 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/60 shrink-0 relative">
                    <img 
                      src={imagePreview} 
                      alt="Game Cover Preview" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white block truncate">
                      {imageFile?.name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {((imageFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-850 transition-all cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-950/60 hover:bg-zinc-950 transition-all text-center group">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 group-hover:bg-indigo-600/20 border border-zinc-800 group-hover:border-indigo-500/30 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition-all">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-zinc-400">
                    <span className="font-semibold text-indigo-400 group-hover:underline">Click to upload cover image</span>
                    <span className="block text-[11px] text-zinc-500 mt-0.5">Displayed on the arcade game card</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Downloading and saving on server...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download to Public & Add to /arcade</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Links Suggestions */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-400 block mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Click any popular preset link to test:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrlInput(item.url);
                    setTitleInput(item.name);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 hover:border-indigo-500/40"
                >
                  <span>{item.name}</span>
                  <span className="text-indigo-400">↳</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Imported Games Table / Library Management */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <HardDrive className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Your Saved Custom Games</h3>
            </div>
            <span className="text-xs text-zinc-400">
              Total: <strong className="text-indigo-400">{importedGames.length}</strong> games
            </span>
          </div>

          {isFetchingList ? (
            <div className="py-8 text-center text-xs text-zinc-500">Loading...</div>
          ) : importedGames.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              No custom games imported yet. Enter a URL above to import.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {importedGames.map((game) => (
                <div
                  key={game.id}
                  className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3 group hover:border-indigo-500/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shrink-0 overflow-hidden">
                      {game.imageUrl ? (
                        <img src={game.imageUrl} alt={game.title} className="h-full w-full object-cover" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white truncate">{game.title}</h4>
                        {game.slug && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            /{game.slug}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 truncate">{game.romUrl} ({game.sizeText})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/arcade"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-400 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Play</span>
                    </Link>

                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-all cursor-pointer"
                      title="Delete Game"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
