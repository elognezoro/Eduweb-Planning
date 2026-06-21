"use client";

import * as React from "react";
import type { BusPosition } from "@/lib/transport/transport";

/* ============================================================================
   Carte de géolocalisation du car (OpenStreetMap via Leaflet, chargé par CDN
   — aucune dépendance npm ni clé API). Affiche le marqueur du car et le
   recentre à chaque mise à jour de position.
   ========================================================================== */

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

/** Centre par défaut (Abidjan) si aucune position connue. */
const FALLBACK: [number, number] = [5.3599, -4.0083];

type LMap = {
  setView: (c: [number, number], z: number) => LMap;
  remove: () => void;
};
type LMarker = {
  setLatLng: (c: [number, number]) => LMarker;
  addTo: (m: LMap) => LMarker;
  bindPopup: (html: string) => LMarker;
};
type LTileLayer = { addTo: (m: LMap) => LTileLayer };
type LeafletNS = {
  map: (el: HTMLElement, opts?: Record<string, unknown>) => LMap;
  tileLayer: (url: string, opts?: Record<string, unknown>) => LTileLayer;
  marker: (c: [number, number], opts?: Record<string, unknown>) => LMarker;
  divIcon: (opts: Record<string, unknown>) => unknown;
};

declare global {
  interface Window {
    L?: LeafletNS;
  }
}

function loadLeaflet(): Promise<LeafletNS | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window.L) return resolve(window.L);
    if (!document.querySelector(`link[data-leaflet]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      link.setAttribute("data-leaflet", "1");
      document.head.appendChild(link);
    }
    let script = document.querySelector<HTMLScriptElement>("script[data-leaflet]");
    if (!script) {
      script = document.createElement("script");
      script.src = LEAFLET_JS;
      script.async = true;
      script.setAttribute("data-leaflet", "1");
      document.body.appendChild(script);
    }
    const start = Date.now();
    const check = () => {
      if (window.L) return resolve(window.L);
      if (Date.now() - start > 10000) return resolve(null);
      window.setTimeout(check, 120);
    };
    script.addEventListener("load", () => resolve(window.L ?? null));
    check();
  });
}

function busIcon(L: LeafletNS): unknown {
  return L.divIcon({
    className: "",
    html: '<div style="font-size:26px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🚌</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function BusMap({
  position,
  center,
  height = 380,
}: {
  position: BusPosition | null;
  center?: { lat: number; lng: number } | null;
  height?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<LMap | null>(null);
  const markerRef = React.useRef<LMarker | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = await loadLeaflet();
      if (!L || cancelled || !ref.current || mapRef.current) return;
      const c: [number, number] = position
        ? [position.lat, position.lng]
        : center
          ? [center.lat, center.lng]
          : FALLBACK;
      const map = L.map(ref.current, { zoomControl: true }).setView(c, 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      mapRef.current = map;
      if (position) {
        markerRef.current = L.marker(c, { icon: busIcon(L) as object })
          .addTo(map)
          .bindPopup("Car de transport");
      }
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // init unique au montage ; les MAJ de position sont gérées par l'effet suivant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour du marqueur / recentrage à chaque nouvelle position.
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;
    const c: [number, number] = [position.lat, position.lng];
    if (markerRef.current) {
      markerRef.current.setLatLng(c);
    } else if (window.L) {
      markerRef.current = window.L
        .marker(c, { icon: busIcon(window.L) as object })
        .addTo(map)
        .bindPopup("Car de transport");
    }
    map.setView(c, 15);
  }, [position?.lat, position?.lng]);

  return (
    <div
      ref={ref}
      style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }}
      className="border border-border bg-muted/30"
    />
  );
}
