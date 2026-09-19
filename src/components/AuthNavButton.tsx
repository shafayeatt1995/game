"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogIn, LogOut, Shield } from "lucide-react";

export function AuthNavButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-8 w-16 bg-zinc-800/60 animate-pulse rounded-xl" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium shrink-0">
          <User className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline font-semibold">{session.user.name || session.user.email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-zinc-300 hover:text-red-400 text-xs transition-colors shrink-0"
          title="Log Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
    >
      <LogIn className="h-3.5 w-3.5" />
      <span>Login</span>
    </Link>
  );
}
