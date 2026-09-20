"use client";

import { AdminHeader } from "@/components/AdminHeader";

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
  Zap,
  Globe,
  Loader2,
  ImageIcon,
  X,
  Plus,
  Edit2,
  ExternalLink,
  Search,
  Gamepad2
} from "lucide-react";
import { CustomGame } from "@/lib/CustomGamesStore";
import { detectPlatform } from "@/lib/detectPlatform";
import { AuthNavButton } from "@/components/AuthNavButton";

export default function AdminPage() {
  const [importedGames, setImportedGames] = useState<CustomGame[]>([]);
  const [isFetchingList, setIsFetchingList] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editGameId, setEditGameId] = useState<string>("");

  // Form State
  const [urlInput, setUrlInput] = useState<string>("");
  const [titleInput, setTitleInput] = useState<string>("");
  const [slugInput, setSlugInput] = useState<string>("");
  const [categoryInput, setCategoryInput] = useState<string>("Auto");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditGameId("");
    setUrlInput("");
    setTitleInput("");
    setSlugInput("");
    setCategoryInput("Auto");
    setImageFile(null);
    setImagePreview("");
    setExistingImageUrl("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (game: CustomGame) => {
    setIsEditing(true);
    setEditGameId(game.id);
    setUrlInput(game.romUrl || "");
    setTitleInput(game.title || "");
    setSlugInput(game.slug || game.id);
    setCategoryInput(game.category ? game.category.toUpperCase() : "Arcade");
    setImageFile(null);
    setImagePreview(game.imageUrl || "");
    setExistingImageUrl(game.imageUrl || "");
    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !urlInput.trim()) {
      setErrorMessage("Please enter a valid ROM archive or direct .zip URL");
      return;
    }

    if (isEditing && !titleInput.trim()) {
      setErrorMessage("Please provide a game title");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (isEditing) {
        // Edit flow (PUT)
        const formData = new FormData();
        formData.append("id", editGameId);
        formData.append("title", titleInput.trim());
        if (slugInput.trim()) {
          formData.append("slug", slugInput.trim());
        }
        formData.append("category", categoryInput);
        if (imageFile) {
          formData.append("imageFile", imageFile);
        } else if (existingImageUrl) {
          formData.append("imageUrl", existingImageUrl);
        }

        const res = await fetch("/api/import-rom", {
          method: "PUT",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update game");
        }

        setSuccessMessage("Game updated successfully!");
        setTimeout(() => {
          closeModal();
          fetchImportedGames();
        }, 1000);

      } else {
        // Create / Import flow (POST)
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
        setTimeout(() => {
          closeModal();
          fetchImportedGames();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete '${title}' from storage and database?`)) return;

    try {
      const res = await fetch(`/api/import-rom?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        fetchImportedGames();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete game");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting game");
    }
  };

  const filteredGames = importedGames.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (g.title && g.title.toLowerCase().includes(q)) ||
      (g.id && g.id.toLowerCase().includes(q)) ||
      (g.slug && g.slug.toLowerCase().includes(q)) ||
      (g.category && g.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <AdminHeader
        title="Arcade Game Management"
        subtitle="Import, configure, and manage arcade and retro ROMs stored in cloud"
        badge="Cloud Sync"
        actionButton={
          <button
            onClick={openCreateModal}
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Game</span>
          </button>
        }
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/60 border border-zinc-850 p-6 rounded-3xl">
          <div>
            <div className="flex items-center gap-2.5">
              <HardDrive className="h-6 w-6 text-indigo-400" />
              <h2 className="text-xl font-extrabold text-white">Your Saved Custom Games</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Manage all imported arcade and retro games stored in MongoDB Atlas and UploadThing Cloud.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all w-52 sm:w-64"
              />
            </div>

            <button
              onClick={openCreateModal}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Import Game</span>
            </button>
          </div>
        </div>

        {/* Games Table Section */}
        <div className="bg-zinc-950/70 border border-zinc-850 rounded-3xl overflow-hidden shadow-2xl">
          {isFetchingList ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
              <span className="text-xs text-zinc-400">Loading custom games library...</span>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center px-4">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-white">No Games Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                {searchQuery ? "No games match your search query." : "No custom games imported yet. Click 'Add New Game' to import your first game."}
              </p>
              {!searchQuery && (
                <button
                  onClick={openCreateModal}
                  className="mt-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  Import First Game
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Game</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Slug / Route</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/60">
                  {filteredGames.map((game) => {
                    const playUrl = game.slug ? `/arcade/${game.slug}` : `/arcade`;
                    return (
                      <tr
                        key={game.id}
                        className="hover:bg-zinc-900/40 transition-colors group"
                      >
                        {/* Game Title & Cover */}
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <div className="h-12 w-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shrink-0 overflow-hidden relative shadow-md">
                              {game.imageUrl ? (
                                <img
                                  src={game.imageUrl}
                                  alt={game.title}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <Zap className="h-5 w-5 text-indigo-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-xs truncate group-hover:text-indigo-300 transition-colors">
                                {game.title}
                              </h4>
                              <span className="text-[11px] font-mono text-zinc-500 block truncate">
                                ID: {game.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {game.category || "Arcade"}
                          </span>
                        </td>

                        {/* Slug */}
                        <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                          <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                            /{game.slug || game.id}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap text-xs">
                          {game.sizeText || "ROM Archive"}
                        </td>

                        {/* Action Buttons: Play, Edit, Delete */}
                        <td className="py-3 px-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Play Button */}
                            <Link
                              href={playUrl}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                              title="Play this game"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              <span>Play</span>
                            </Link>

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(game)}
                              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                              title="Edit Game Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteGame(game.id, game.title)}
                              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-800/60 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete Game"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* Universal Create / Edit Game Modal (Automatic Game Importer)             */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  {isEditing ? <Edit2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg">
                    {isEditing ? "Edit Game Information" : "Automatic Game Importer"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {isEditing
                      ? "Update the game title, URL slug, category, or cover image."
                      : "Paste any RetroGames URL or direct .zip link to automatically fetch and bundle."}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* URL Input (Required on Create, Readonly/Disabled on Edit) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Game URL or Direct ZIP Link:</span>
                  {!isEditing && (
                    <span className="text-zinc-500 font-normal">Supports RetroGames.cc & Direct .zip</span>
                  )}
                </label>
                <div className="relative">
                  <Globe className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={!isEditing}
                    disabled={isEditing || isLoading}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g. https://www.retrogames.cc/arcade-games/cadillacs-and-dinosaurs-930201-etc.html"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-60 disabled:bg-zinc-900/50"
                  />
                </div>
              </div>

              {/* Title & Slug Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Game Title:
                  </label>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder={isEditing ? "e.g. Cadillacs & Dinosaurs" : "Auto-extracted if left blank"}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Custom URL Slug:
                  </label>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    placeholder="e.g. cadillacs-dinosaurs"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Category Platform Auto-Detection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <span>Platform / Category:</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Auto-Detected
                    </span>
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Detected: <strong className="text-indigo-400">{categoryInput === "Auto" ? detectPlatform(urlInput || editGameId, titleInput) : categoryInput}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["Auto", "Neo Geo", "CPS-1.5", "Arcade"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setCategoryInput(cat)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        categoryInput.toLowerCase() === cat.toLowerCase()
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {cat === "Auto" ? "✨ Auto" : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Cover Image:</span>
                  <span className="text-zinc-500 font-normal">Optional JPG, PNG, or WebP</span>
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
                        {imageFile ? imageFile.name : "Current Game Cover"}
                      </span>
                      {imageFile && (
                        <span className="text-[11px] text-zinc-400">
                          {((imageFile.size || 0) / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setExistingImageUrl("");
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

              {/* Status Alerts */}
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

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isEditing ? "Saving changes..." : "Downloading & bundling ROM..."}</span>
                    </>
                  ) : (
                    <>
                      {isEditing ? <Edit2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                      <span>{isEditing ? "Save Changes" : "Download & Import"}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
