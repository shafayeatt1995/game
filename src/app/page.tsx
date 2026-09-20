import Link from "next/link";
import { 
  Gamepad2, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retro Gaming - Arcade, PS1 & PS2 Web Hub",
  description: "Play your favorite Arcade, Neo-Geo, PS1, and PS2 games directly in your browser with 60 FPS WebAssembly emulation.",
};

const gamingEngines = [
  {
    id: "arcade",
    title: "Arcade & Neo Geo",
    subtitle: "CPS-1.5 / FinalBurn / MAME",
    badge: "Full 60 FPS",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: Gamepad2,
    description: "Enjoy legendary arcade classics like Cadillacs & Dinosaurs (Mustapha), The King of Fighters (KOF '98/2002), and Metal Slug at full 60 FPS with cheats and controller support.",
    features: [
      "Cadillacs & Dinosaurs & Punisher", 
      "King of Fighters (KOF) & Metal Slug", 
      "Built-in Cheat Codes & Auto-Save", 
      "Instant Browser Memory Caching"
    ],
    href: "/arcade",
    btnText: "Launch Arcade",
  },
  {
    id: "ps1",
    title: "PlayStation 1",
    subtitle: "PCSX ReARMed Engine",
    badge: "Rock Solid 60 FPS",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: Zap,
    description: "Play all-time PS1 classics like Tekken 3, Gran Turismo 2, and Crash Bandicoot with zero lag and rock-solid 60 FPS right in your browser.",
    features: [
      "Rock-Solid 60 FPS Performance", 
      "Save & Load State Support", 
      "High-Definition Audio & Visuals", 
      ".ISO, .BIN, .CUE Streaming"
    ],
    href: "/ps1",
    btnText: "Launch PS1",
  },
  {
    id: "ps2",
    title: "PlayStation 2",
    subtitle: "Play! WebAssembly HLE",
    badge: "PS2 Core",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: Gamepad2,
    description: "Play PS2 games right in your browser by selecting your .ISO or .BIN files. No BIOS dump needed—boots automatically via high-level emulation.",
    features: [
      "Local ISO File Streaming", 
      "Zero Server Upload (100% Private)", 
      "Keyboard & USB Gamepad Support", 
      "Hardware-Accelerated WebGL Rendering"
    ],
    href: "/ps2",
    btnText: "Launch PS2",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Gamepad2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Retro Gaming</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Hub
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400">Client-Side WebAssembly Gaming Platform</p>
          </div>
        </div>

        {/* Clean Menu: Home, Arcade, PS1, PS2 (Admin & Login removed) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs font-medium">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm shrink-0"
          >
            Home
          </Link>
          <Link
            href="/arcade"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            Arcade
          </Link>
          <Link
            href="/ps1"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            PS1
          </Link>
          <Link
            href="/ps2"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            PS2
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Glow ambient */}
        <div className="absolute w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
        <div className="absolute w-80 sm:w-96 h-80 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          All-in-One In-Browser Gaming Hub
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Play Retro & Console Games Directly in Your Browser
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed mb-6 sm:mb-8 px-2">
          Drop any retro or console game files right into your browser. Nothing uploads to any server; everything runs 100% locally on your machine powered by WebAssembly.
        </p>

        {/* Feature quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-base sm:text-lg font-bold text-white">100% Local</div>
            <div className="text-[11px] sm:text-xs text-zinc-400">Zero Server Upload</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-base sm:text-lg font-bold text-indigo-400">60+ FPS</div>
            <div className="text-[11px] sm:text-xs text-zinc-400">Arcade & PS1</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-base sm:text-lg font-bold text-indigo-400">Gamepad</div>
            <div className="text-[11px] sm:text-xs text-zinc-400">PS4, PS5 & Xbox Ready</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-base sm:text-lg font-bold text-indigo-400">Offline Cache</div>
            <div className="text-[11px] sm:text-xs text-zinc-400">IndexedDB Memory</div>
          </div>
        </div>
      </section>

      {/* Main Console Hub Grid: 3 Clean Cards (Arcade, PS1, PS2) */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-white">Select a Gaming Platform & Core</h3>
          <p className="text-xs text-zinc-400">Click any console engine below to start playing your favorite games</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {gamingEngines.map((engine) => {
            const Icon = engine.icon;
            return (
              <div
                key={engine.id}
                className="group relative bg-zinc-950 border border-zinc-800/90 hover:border-indigo-500/50 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar of card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-md">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                      {engine.badge}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {engine.title}
                  </h4>
                  <div className="text-xs font-medium text-zinc-400 mb-2.5">{engine.subtitle}</div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-5 line-clamp-3">
                    {engine.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {engine.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action button */}
                <Link
                  href={engine.href}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{engine.btnText}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 px-4 sm:px-6 py-5 text-center text-xs text-zinc-500">
        Retro Gaming Hub • Powered by Next.js, WebAssembly & WebGL.
      </footer>
    </div>
  );
}
