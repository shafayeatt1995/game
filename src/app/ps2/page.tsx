import PS2Emulator from "@/components/PS2Emulator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlaySphere PS2 - Browser PlayStation 2 Emulator",
  description: "Play your favorite PlayStation 2 games right in your web browser using WebAssembly and local ISO streaming.",
};

export default function PS2Page() {
  return <PS2Emulator />;
}
