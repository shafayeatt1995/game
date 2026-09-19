import { Suspense } from "react";
import ArcadeCatalog from "@/components/ArcadeCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arcade & Neo Geo Games Library - Play 60 FPS in Browser",
  description: "Browse and play classic Capcom CPS-1.5, CPS-2 and SNK Neo Geo games at 60 FPS with USB joystick support and offline storage.",
};

export default function ArcadePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Arcade Games...</div>}>
      <ArcadeCatalog />
    </Suspense>
  );
}
