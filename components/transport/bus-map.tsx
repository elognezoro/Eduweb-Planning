"use client";

import * as React from "react";

/* ============================================================================
   Carte de géolocalisation des cars (OpenStreetMap via Leaflet, chargé par CDN
   — aucune dépendance npm ni clé API). Un marqueur par car, étiqueté avec son
   matricule ; recadrage automatique sur l'ensemble des cars.
   ========================================================================== */

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

/** Centre par défaut (Abidjan) si aucune position connue. */
const FALLBACK: [number, number] = [5.3599, -4.0083];

export interface BusMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

type LMarker = {
  setLatLng: (c: [number, number]) => LMarker;
  addTo: (m: LMap) => LMarker;
  bindTooltip: (html: string, opts?: Record<string, unknown>) => LMarker;
  remove: () => void;
};
type LMap = {
  setView: (c: [number, number], z: number) => LMap;
  fitBounds: (b: [number, number][], opts?: Record<string, unknown>) => LMap;
  remove: () => void;
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
    if (!document.querySelector("link[data-leaflet]")) {
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

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;",
  );
}

function busIcon(L: LeafletNS, label: string): unknown {
  return L.divIcon({
    className: "",
    html:
      '<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px)">' +
      '<div style="font-size:24px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🚌</div>' +
      `<div style="background:#13402f;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:6px;white-space:nowrap;margin-top:1px;box-shadow:0 1px 2px rgba(0,0,0,.3)">${esc(label)}</div>` +
      "</div>",
    iconSize: [40, 44],
    iconAnchor: [20, 38],
  });
}

export function BusMap({
  markers,
  center,
  height = 400,
}: {
  markers: BusMarker[];
  center?: { lat: number; lng: number } | null;
  height?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<LMap | null>(null);
  const lRef = React.useRef<LeafletNS | null>(null);
  const markerMap = React.useRef<Map<string, LMarker>>(new Map());
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = await loadLeaflet();
      if (!L || cancelled || !ref.current || mapRef.current) return;
      const start: [number, number] =
        center ? [center.lat, center.lng] : FALLBACK;
      const map = L.map(ref.current, { zoomControl: true }).setView(start, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      mapRef.current = map;
      lRef.current = L;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      markerMap.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      lRef.current = null;
    };
    // init unique
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronise les marqueurs avec la liste des cars.
  React.useEffect(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!ready || !map || !L) return;
    const seen = new Set<string>();
    for (const m of markers) {
      seen.add(m.id);
      const existing = markerMap.current.get(m.id);
      if (existing) {
        existing.setLatLng([m.lat, m.lng]);
      } else {
        const mk = L.marker([m.lat, m.lng], {
          icon: busIcon(L, m.label) as object,
        })
          .addTo(map)
          .bindTooltip(esc(m.label), { direction: "top", offset: [0, -38] });
        markerMap.current.set(m.id, mk);
      }
    }
    // Retire les cars disparus.
    for (const [id, mk] of markerMap.current) {
      if (!seen.has(id)) {
        mk.remove();
        markerMap.current.delete(id);
      }
    }
    // Recadrage.
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 15);
    } else if (markers.length > 1) {
      map.fitBounds(
        markers.map((m) => [m.lat, m.lng] as [number, number]),
        { padding: [40, 40], maxZoom: 16 },
      );
    }
  }, [ready, markers]);

  return (
    <div
      ref={ref}
      style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }}
      className="border border-border bg-muted/30"
    />
  );
}
