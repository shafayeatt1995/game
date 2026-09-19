import SourcePortsEmulator from "@/components/SourcePortsEmulator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlaySphere SourcePorts - GTA Vice City reVC (60+ FPS Native WebAssembly)",
  description: "Play GTA Vice City directly in your browser using the reVC native WebAssembly C++ engine at 60+ FPS with zero emulation lag.",
};

export default function SourcePortsPage() {
  return <SourcePortsEmulator />;
}
