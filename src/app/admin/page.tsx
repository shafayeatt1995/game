import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  Gamepad2, 
  Users, 
  HardDrive, 
  Cloud, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Disc, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Play
} from "lucide-react";
import { AuthNavButton } from "@/components/AuthNavButton";

export const dynamic = "force-dynamic";

export default async function AdminStatisticsPage() {
  // Fetch real data from MongoDB Atlas
  let totalGames = 0;
  let totalUsers = 0;
  let gamesList: any[] = [];
  let recentUsers: any[] = [];

  try {
    const [gamesCount, usersCount, games, users] = await Promise.all([
      prisma.game.count(),
      prisma.user.count(),
      prisma.game.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    totalGames = gamesCount;
    totalUsers = usersCount;
    gamesList = games;
    recentUsers = users;
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
  }

  // Calculate approximate cloud storage used by games
  const totalCloudStorageMb = gamesList.reduce((acc, curr) => {
    const sizeMatch = curr.sizeText?.match(/([\d.]+)\s*MB/i);
    return acc + (sizeMatch ? parseFloat(sizeMatch[1]) : 0);
  }, 0);

  const statsCards = [
    {
      title: "Total Games Hosted",
      value: totalGames,
      desc: "Cloud ROMs & metadata in MongoDB",
      icon: Gamepad2,
      trend: "+ Active",
      gradient: "from-indigo-600/20 via-indigo-500/10 to-transparent",
      borderColor: "border-indigo-500/30",
      textColor: "text-indigo-400",
    },
    {
      title: "Registered Admins / Users",
      value: totalUsers,
      desc: "Authenticated with NextAuth",
      icon: Users,
      trend: "Protected",
      gradient: "from-violet-600/20 via-violet-500/10 to-transparent",
      borderColor: "border-violet-500/30",
      textColor: "text-violet-400",
    },
    {
      title: "Active Storage Provider",
      value: "UploadThing",
      desc: "CDN storage with zero Vercel limits",
      icon: Cloud,
      trend: "Online",
      gradient: "from-blue-600/20 via-blue-500/10 to-transparent",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      title: "Estimated ROM Storage",
      value: `${totalCloudStorageMb.toFixed(1)} MB`,
      desc: "High-speed WebAssembly cache ready",
      icon: HardDrive,
      trend: "Cached",
      gradient: "from-emerald-600/20 via-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
    },
  ];

  const platforms = [
    {
      name: "Arcade & Neo-Geo (FinalBurn/CPS)",
      gamesCount: totalGames,
      status: "Operational",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      icon: Gamepad2,
      manageHref: "/admin/arcad",
    },
    {
      name: "PlayStation 1 (PCSX ReARMed)",
      gamesCount: "Local",
      status: "Ready",
      statusColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      icon: Zap,
      manageHref: "/ps1",
    },
    {
      name: "GTA Vice City (reVC Port)",
      gamesCount: "Native",
      status: "60+ FPS",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      icon: Flame,
      manageHref: "/sourceports",
    },
    {
      name: "PlayStation 2 (Play! HLE)",
      gamesCount: "Local",
      status: "Ready",
      statusColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
      icon: Disc,
      manageHref: "/ps2",
    },
  ];

  return (
    <div className="flex-1 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Platform Statistics & Overview</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Live Data
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Real-time MongoDB Atlas statistics and UploadThing storage analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/arcad"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>+ Import ROM</span>
          </Link>
          <div className="hidden lg:block">
            <AuthNavButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
        {/* KPI Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`relative p-5 rounded-3xl bg-gradient-to-b ${card.gradient} bg-zinc-950 border ${card.borderColor} shadow-xl flex flex-col justify-between overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center ${card.textColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {card.trend}
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-xs font-bold text-zinc-300 mt-1">{card.title}</div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Platform Status & Recent Games */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platforms Overview (1 Col) */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>Emulation Engines</span>
                </h3>
                <span className="text-[10px] text-zinc-400">4 Cores Active</span>
              </div>

              <div className="space-y-3">
                {platforms.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                          <Icon className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-zinc-500">
                            Count: <strong className="text-indigo-300">{p.gamesCount}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.statusColor}`}>
                          {p.status}
                        </span>
                        <Link
                          href={p.manageHref}
                          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Open"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Database Engine</span>
              <span className="text-indigo-400 font-semibold font-mono">MongoDB Atlas (Prisma 6)</span>
            </div>
          </div>

          {/* Recently Imported Games List (2 Cols) */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Recently Hosted Games in Database</h3>
                </div>
                <Link
                  href="/admin/arcad"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-semibold"
                >
                  <span>Manage All</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              {gamesList.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                  No games found in the database yet.
                  <div className="mt-3">
                    <Link
                      href="/admin/arcad"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-block"
                    >
                      Import First Game
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {gamesList.map((game) => (
                    <div
                      key={game.id}
                      className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3 group hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 shrink-0 overflow-hidden">
                          {game.imageUrl ? (
                            <img src={game.imageUrl} alt={game.title} className="h-full w-full object-cover" />
                          ) : (
                            <Gamepad2 className="h-4 w-4 text-indigo-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-white truncate">{game.title}</h4>
                          </div>
                          <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-indigo-300">/{game.slug || game.id}</span>
                            <span>•</span>
                            <span>{game.sizeText}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/arcade"
                        className="p-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all shrink-0"
                        title="Play in Arcade"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick action bar */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-zinc-400 text-[11px]">
                Storage Mode: <span className="text-white font-semibold">UploadThing Permanent CDN</span>
              </div>
              <Link
                href="/admin/arcad"
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 text-xs font-semibold transition-all"
              >
                Go to Arcade Importer →
              </Link>
            </div>
          </div>
        </section>

        {/* Database Security & Users */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Database Administrators & Auth Credentials</h3>
            </div>
            <span className="text-xs text-zinc-400">Prisma User Collection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                  {u.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{u.name || "User"}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{u.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {u.role}
                    </span>
                    <span className="text-[10px] text-zinc-600">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
