import { Suspense } from "react";
import ArcadeEmulator from "@/components/ArcadeEmulator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arcade & Neo Geo 60 FPS - Cadillacs and Dinosaurs & King of Fighters",
  description: "Play classic Capcom CPS-1.5 Cadillacs and Dinosaurs (Mustapha) and SNK Neo Geo King of Fighters at full 60 FPS in your browser.",
};

export default function ArcadePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Arcade Hub...</div>}>
      <ArcadeEmulator />
    </Suspense>
  );
}
