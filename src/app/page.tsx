import Link from "next/link";
import { 
  Gamepad2, 
  Disc, 
  Flame, 
  Zap, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  Monitor, 
  HardDrive, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Play
} from "lucide-react";
import { AuthNavButton } from "@/components/AuthNavButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlaySphere Web Hub - Retro PlayStation & Source Port Hub",
  description: "Next-generation in-browser gaming hub. Play PS2, PS1 at 60 FPS, and native GTA Vice City with local file streaming.",
};

const gamingEngines = [
  {
    id: "arcade",
    title: "Arcade & Neo Geo",
    subtitle: "CPS-1.5 / FinalBurn / MAME",
    badge: "Full 60 FPS",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    gradient: "from-indigo-600 via-indigo-500 to-violet-500",
    glowColor: "group-hover:shadow-indigo-500/20",
    icon: Gamepad2,
    iconColor: "text-indigo-400",
    description: "Enjoy legendary arcade classics like Cadillacs & Dinosaurs (Mustapha), The King of Fighters (KOF '98/2002), and Metal Slug at full 60 FPS.",
    fps: "Full 60 FPS (Ultra Smooth)",
    features: ["Cadillacs & Dinosaurs (Mustapha)", "King of Fighters (KOF) Support", "USB Arcade Joystick / Gamepad", "Instant Browser Memory Cache"],
    href: "/arcade",
    btnText: "Launch Arcade & Neo Geo",
    btnGradient: "from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25",
  },
  {
    id: "ps1",
    title: "PlayStation 1",
    subtitle: "PCSX ReARMed Engine",
    badge: "Rock Solid 60 FPS",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    gradient: "from-indigo-600 via-indigo-500 to-blue-500",
    glowColor: "group-hover:shadow-indigo-500/20",
    icon: Zap,
    iconColor: "text-indigo-400",
    description: "Play all-time PS1 classics like Tekken 3, Gran Turismo 2, and NFS 3 with zero lag and rock-solid 60 FPS right in your browser.",
    fps: "Full 60 FPS (Full Speed)",
    features: ["Rock-Solid 60 FPS Performance", "Save & Load State Support", "PS1 Continuous Audio", ".ISO, .BIN, .CUE Support"],
    href: "/ps1",
    btnText: "Launch PS1 Player (60 FPS)",
    btnGradient: "from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25",
  },
  {
    id: "sourceports",
    title: "GTA Vice City (reVC)",
    subtitle: "Native C++ Source Port",
    badge: "Native 60+ FPS",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    gradient: "from-indigo-600 via-violet-600 to-indigo-500",
    glowColor: "group-hover:shadow-indigo-500/20",
    icon: Flame,
    iconColor: "text-indigo-400",
    description: "Experience reverse-engineered native GTA Vice City with zero emulator overhead. Rendered via WebGL and WebAssembly at 60+ FPS.",
    fps: "60+ FPS (Native C++)",
    features: ["Zero Emulation Overhead", "Original PC 3D Graphics", "Direct Keyboard & Mouse Input", "Instant Game Boot"],
    href: "/sourceports",
    btnText: "Play GTA Vice City (60+ FPS)",
    btnGradient: "from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25",
  },
  {
    id: "ps2",
    title: "PlayStation 2",
    subtitle: "Play! WebAssembly HLE",
    badge: "PS2 Core",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    gradient: "from-indigo-600 via-blue-600 to-indigo-400",
    glowColor: "group-hover:shadow-indigo-500/20",
    icon: Gamepad2,
    iconColor: "text-indigo-400",
    description: "Play PS2 games right in your browser by selecting your .ISO or .BIN files. No BIOS dump needed—boots automatically via HLE.",
    fps: "10-30 FPS (HLE)",
    features: ["Local ISO File Streaming", "Zero Server Upload", "Keyboard & USB Gamepad Support", "4:3 Centering Display"],
    href: "/ps2",
    btnText: "Launch PS2 Player",
    btnGradient: "from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/25",
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
              <span>PlaySphere Web Hub</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400">Client-Side WebAssembly Gaming Platform</p>
          </div>
        </div>

        {/* Console Switcher Navigation (Fully Mobile Scrollable) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 text-xs">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm shrink-0"
          >
            Home
          </Link>
          <Link
            href="/arcade"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            Arcade & Neo-Geo
          </Link>
          <Link
            href="/ps1"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            PS1 (60 FPS)
          </Link>
          <Link
            href="/sourceports"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            reVC (GTA 60+)
          </Link>
          <Link
            href="/ps2"
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
          >
            PS2
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-xl text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors font-medium shrink-0"
          >
            Admin
          </Link>
          <AuthNavButton />
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

        {/* Feature quick stats (Responsive 2 cols on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-base sm:text-lg font-bold text-white">100% Local</div>
            <div className="text-[11px] sm:text-xs text-zinc-400">Zero Server Upload</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-base sm:text-lg font-bold text-indigo-400">60+ FPS</div>
            <div className="text-[11px] sm:text-xs text-zinc-400">Arcade, PS1 & reVC</div>
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

      {/* Main Console Hub Grid */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white">Select a Gaming Platform & Core</h3>
          <p className="text-xs text-zinc-400">Click any console engine below to start playing your favorite games</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
        PlaySphere Gaming Hub • Powered by Next.js, WebAssembly & WebGL. Built with Tailwind CSS Indigo Design System.
      </footer>
    </div>
  );
}
