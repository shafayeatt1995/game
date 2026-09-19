import PS1Emulator from "@/components/PS1Emulator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlaySphere PS1 - 60 FPS PlayStation 1 Browser Emulator",
  description: "Play your favorite PlayStation 1 games right in your web browser at rock-solid 60 FPS with local ISO/BIN streaming.",
};

export default function PS1Page() {
  return <PS1Emulator />;
}
