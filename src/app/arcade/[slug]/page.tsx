import { Suspense } from "react";
import ArcadeEmulator from "@/components/ArcadeEmulator";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `Play ${capitalized} Arcade - PlaySphere Web Hub`,
    description: `Play ${capitalized} retro arcade and Neo-Geo game online at 60 FPS in your browser with USB Gamepad support.`,
  };
}

export default async function ArcadeGameSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading {slug}...</div>}>
      <ArcadeEmulator activeSlug={slug} />
    </Suspense>
  );
}
