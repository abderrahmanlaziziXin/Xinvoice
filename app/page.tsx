"use client";

import { Suspense, lazy } from "react";

// Lazy load the heavy Hero component
const Hero = lazy(() =>
  import("./components/hero").then((module) => ({ default: module.Hero }))
);

// Simple loading fallback
function HeroSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-xinfinity-primary via-xinfinity-secondary to-xinfinity-accent">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-semibold">Loading Xinvoice...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/*  */}
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
    </main>
  );
}
