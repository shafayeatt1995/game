"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2 } from "lucide-react";

interface SiteHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  rightElements?: React.ReactNode;
}

export function SiteHeader({
  title = "Retro Gaming",
  subtitle = "Client-Side WebAssembly Gaming Platform",
  badge,
  rightElements,
}: SiteHeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Arcade", href: "/arcade" },
    { name: "PS1", href: "/ps1" },
    { name: "PS2", href: "/ps2" },
  ];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <Link 
          href="/" 
          className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10 hover:border-indigo-400 transition-colors shrink-0"
        >
          <Gamepad2 className="h-5 w-5 text-indigo-400" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{title}</span>
            </h1>
            {badge && (
              <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-400">{subtitle}</p>
        </div>
      </div>

      {/* Navigation (Home, Arcade, PS1, PS2) */}
      <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs font-medium">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Optional Right Action Elements (FPS, Controls, Fullscreen etc) */}
      {rightElements && (
        <div className="flex items-center gap-2">
          {rightElements}
        </div>
      )}
    </header>
  );
}
