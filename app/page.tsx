"use client";

import dynamic from "next/dynamic";

// Dynamic import for Leaflet component (no SSR)
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function Home() {
  return <Map />;
}
