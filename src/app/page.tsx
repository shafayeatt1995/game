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
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlaySphere Web Hub - Retro PlayStation & Source Port Hub",
  description: "Next-generation in-browser gaming hub. Play PS2, PS1 at 60 FPS, and native GTA Vice City with local file streaming.",
};

const gamingEngines = [
  {
    id: "ps2",
    title: "PlayStation 2",
    subtitle: "Play! WebAssembly HLE",
    badge: "PS2 Core",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    gradient: "from-blue-600 via-indigo-600 to-cyan-500",
    glowColor: "group-hover:shadow-blue-500/20",
    icon: Gamepad2,
    iconColor: "text-blue-400",
    description: "আপনার কম্পিউটারের .ISO বা .BIN ফাইল সিলেক্ট করে ব্রাউজারেই PS2 গেম খেলুন। কোনো BIOS ফাইল ছাড়াই স্বয়ংক্রিয়ভাবে গেম বুট হয়।",
    fps: "১০-৩০ FPS (HLE)",
    features: ["লোকাল ISO স্ট্রিমিং", "জিরো সার্ভার আপলোড", "কিবোর্ড ও USB গেমপ্যাড সাপোর্ট", "4:3 সেন্টারিং মোড"],
    href: "/ps2",
    btnText: "PS2 এমুলেটর চালু করুন",
    btnGradient: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500",
  },
  {
    id: "ps1",
    title: "PlayStation 1",
    subtitle: "PCSX ReARMed Engine",
    badge: "Rock Solid 60 FPS",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    gradient: "from-emerald-600 via-teal-600 to-cyan-500",
    glowColor: "group-hover:shadow-emerald-500/20",
    icon: Zap,
    iconColor: "text-emerald-400",
    description: "Tekken 3, Gran Turismo 2, NFS 3-এর মতো সর্বকালের সেরা PS1 ক্লাসিকগুলো M1 ম্যাকবুকে ০% ল্যাগে ফুল ৬০ FPS-এ উপভোগ করুন।",
    fps: "ফুল ৬০ FPS (Full Speed)",
    features: ["রক-সলিড ৬০ FPS পারফরম্যান্স", "সেভ স্টেট ও লোড সাপোর্ট", "PS1 কন্টিনুয়াস সাউন্ড", ".ISO, .BIN, .CUE সাপোর্ট"],
    href: "/ps1",
    btnText: "PS1 এমুলেটর চালু করুন (60 FPS)",
    btnGradient: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
  },
  {
    id: "arcade",
    title: "Arcade & Neo Geo",
    subtitle: "CPS-1.5 / FinalBurn / MAME",
    badge: "Full 60 FPS",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    gradient: "from-red-600 via-orange-600 to-amber-500",
    glowColor: "group-hover:shadow-orange-500/20",
    icon: Gamepad2,
    iconColor: "text-orange-400",
    description: "মুস্তাফা (Cadillacs & Dinosaurs), King of Fighters (KOF '98/2002), Metal Slug-এর মতো কিংবদন্তি আর্কেড গেম ৬০ FPS-এ উপভোগ করুন।",
    fps: "ফুল ৬০ FPS (100% মসৃণ)",
    features: ["ক্যাডিল্যাক্স অ্যান্ড ডাইনোসরস (Mustapha)", "King of Fighters (KOF) সাপোর্ট", "ইউএসবি আর্কেড জয়স্টিক / গেমপ্যাড", "লোকাল .zip রম লোডার"],
    href: "/arcade",
    btnText: "আর্কেড ও নিও জিও চালু করুন",
    btnGradient: "from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500",
  },
  {
    id: "sourceports",
    title: "GTA Vice City (reVC)",
    subtitle: "Native C++ Source Port",
    badge: "Native 60+ FPS",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    glowColor: "group-hover:shadow-orange-500/20",
    icon: Flame,
    iconColor: "text-amber-400",
    description: "কোনো এমুলেটর ছাড়াই সরাসরি ব্রাউজারে রিভার্স-ইঞ্জিনিয়ার্ড নেটিভ GTA Vice City খেলুন। WebGL ও WebAssembly দিয়ে ৬০+ FPS মাখনের মতো স্মুথ।",
    fps: "৬০+ FPS (Native C++)",
    features: ["জিরো এমুলেশন ওভারহেড", "অরিজিনাল পিসি 3D গ্রাফিক্স", "মাউস ও কীবোর্ড ডিরেক্ট ইনপুট", "ইনস্ট্যান্ট বুট"],
    href: "/sourceports",
    btnText: "GTA Vice City খেলুন (60+ FPS)",
    btnGradient: "from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
              PlaySphere Web Hub
            </h1>
            <p className="text-xs text-zinc-400">Next-Gen Client-Side Browser Gaming Platform</p>
          </div>
        </div>

        {/* Console Switcher Navigation */}
        <nav className="hidden md:flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl text-xs">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-white font-semibold shadow"
          >
            হোম
          </Link>
          <Link
            href="/arcade"
            className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            Arcade & Neo-Geo
          </Link>
          <Link
            href="/ps1"
            className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            PS1 (60 FPS)
          </Link>
          <Link
            href="/ps2"
            className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            PS2 (Play!)
          </Link>
          <Link
            href="/sourceports"
            className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            reVC (GTA 60+ FPS)
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-8 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Glow ambient */}
        <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
        <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          অল-ইন-ওয়ান ব্রাউজার গেমিং হাব
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          কোনো ইন্সটলেশন ছাড়াই সরাসরি ব্রাউজারে খেলুন
        </h2>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed mb-8">
          আপনার কম্পিউটারে থাকা যেকোনো PlayStation বা রেট্রো গেমের ফাইল ব্রাউজারে ড্রপ করুন। কোনো ফাইল সার্ভারে আপলোড হবে না; WebAssembly-র মাধ্যমে সরাসরি আপনার পিসির শক্তিতে গেম চলবে।
        </p>

        {/* Feature quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-lg font-bold text-white">১০০% লোকাল</div>
            <div className="text-xs text-zinc-400">জিরো সার্ভার আপলোড</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-lg font-bold text-emerald-400">৬০+ FPS</div>
            <div className="text-xs text-zinc-400">PS1 ও Native reVC</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-lg font-bold text-cyan-400">গেমপ্যাড</div>
            <div className="text-xs text-zinc-400">PS4, PS5 ও Xbox রেডি</div>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="text-lg font-bold text-indigo-400">নো BIOS</div>
            <div className="text-xs text-zinc-400">অটো বুট সিস্টেম</div>
          </div>
        </div>
      </section>

      {/* Main Console Hub Grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">গেমিং প্ল্যাটফর্ম ও ইঞ্জিন নির্বাচন করুন</h3>
            <p className="text-xs text-zinc-400">আপনার পছন্দের কনসোলটিতে ক্লিক করে যেকোনো গেম চালু করুন</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gamingEngines.map((engine) => {
            const Icon = engine.icon;
            return (
              <div
                key={engine.id}
                className="group relative bg-zinc-950/80 border border-zinc-800/90 hover:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl flex-1 hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar of card */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${engine.gradient} p-0.5 flex items-center justify-center shadow-lg`}>
                      <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <Icon className={`h-6 w-6 ${engine.iconColor}`} />
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${engine.badgeColor}`}>
                      {engine.badge}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {engine.title}
                  </h4>
                  <div className="text-xs font-medium text-zinc-400 mb-3">{engine.subtitle}</div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {engine.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {engine.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action button */}
                <Link
                  href={engine.href}
                  className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r ${engine.btnGradient} text-white font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02] cursor-pointer`}
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
      <footer className="mt-auto border-t border-zinc-900 px-6 py-6 text-center text-xs text-zinc-500">
        PlaySphere Gaming Hub • Powered by Next.js, WebAssembly & WebGL. Built for modern high-performance browser gaming.
      </footer>
    </div>
  );
}
