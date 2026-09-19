"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Gamepad2, 
  Disc, 
  Flame, 
  Zap, 
  Sliders, 
  Menu, 
  X, 
  Home, 
  Shield, 
  Database, 
  LogOut,
  Layers,
  ChevronRight
} from "lucide-react";
import { AuthNavButton } from "@/components/AuthNavButton";

const adminNavItems = [
  {
    name: "Overview & Statistics",
    href: "/admin",
    icon: Sliders,
    badge: "Dashboard",
    desc: "Platform stats & storage analytics",
  },
  {
    name: "Arcade & Neo-Geo",
    href: "/admin/arcad",
    icon: Gamepad2,
    badge: "Active",
    desc: "Import & Manage Arcade ROMs",
  },
  {
    name: "PlayStation 1 (PS1)",
    href: "/admin/ps1",
    icon: Zap,
    badge: "Soon",
    desc: "PS1 ISO / BIN Management",
  },
  {
    name: "GTA Vice City (reVC)",
    href: "/admin/sourceports",
    icon: Flame,
    badge: "Soon",
    desc: "Native Port Game Assets",
  },
  {
    name: "PlayStation 2 (PS2)",
    href: "/admin/ps2",
    icon: Disc,
    badge: "Soon",
    desc: "PS2 ISO Streaming",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top trigger bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-white">Admin Dashboard</span>
          </div>
        </div>
        <AuthNavButton />
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-zinc-950 border-r border-zinc-800/90 flex flex-col transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-3 group"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
              <Gamepad2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>PlaySphere</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Cloud ROM & Asset Manager</p>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <Layers className="h-3 w-3" />
              <span>Console Platforms</span>
            </div>

            <nav className="space-y-1.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "bg-zinc-900 group-hover:bg-zinc-800 text-zinc-400 group-hover:text-indigo-400 border border-zinc-800"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold leading-tight">{item.name}</div>
                        <div
                          className={`text-[10px] font-normal leading-tight mt-0.5 ${
                            isActive ? "text-indigo-200" : "text-zinc-500"
                          }`}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badge === "Active"
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "bg-zinc-800/80 text-zinc-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Hub Links */}
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <Database className="h-3 w-3" />
              <span>Quick Links</span>
            </div>
            <div className="space-y-1 text-xs">
              <Link
                href="/arcade"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <span>Live Arcade Player</span>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              </Link>
              <Link
                href="/"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <span>Website Homepage</span>
                <Home className="h-3.5 w-3.5 text-zinc-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* User Account & Logout Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/50">
          <div className="flex items-center justify-between">
            <AuthNavButton />
          </div>
        </div>
      </aside>
    </>
  );
}
