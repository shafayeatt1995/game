"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { AuthNavButton } from "@/components/AuthNavButton";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actionButton?: React.ReactNode;
}

export function AdminHeader({
  title,
  subtitle,
  badge = "Cloud Sync",
  actionButton,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Website Home</span>
        </Link>
        <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></div>
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <h1 className="font-extrabold text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>{title}</span>
              {badge && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                  {badge}
                </span>
              )}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actionButton}
        <div className="hidden sm:block">
          <AuthNavButton />
        </div>
      </div>
    </header>
  );
}
