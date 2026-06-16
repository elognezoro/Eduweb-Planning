"use client";

import * as React from "react";

/**
 * Photo de profil : stockage local (data-URL) + synchronisation entre composants
 * (page profil, topbar, sidebar) via un événement window.
 * Au dépôt : type JPG/PNG et dimensions ≥ 200×200 px exigés ; quelle que soit la
 * taille d'origine, la photo est rognée au carré (centré) et compressée
 * automatiquement (export 512×512 JPEG ≈ quelques dizaines de Ko).
 */
export const PHOTO_MIN_DIM = 200;
export const PHOTO_OUTPUT_SIZE = 512;
export const PHOTO_QUALITY = 0.85;
export const PHOTO_ACCEPTED = ["image/jpeg", "image/png"];

const KEY = "eduweb.avatar.v1";
const EVENT = "eduweb:avatar-changed";

export function loadProfilePhoto(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveProfilePhoto(dataUrl: string | null) {
  try {
    if (dataUrl) localStorage.setItem(KEY, dataUrl);
    else localStorage.removeItem(KEY);
  } catch {
    /* quota dépassé : on garde l'état en mémoire */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: dataUrl }));
}

/** Photo de profil courante, synchronisée en direct entre tous les composants. */
export function useProfilePhoto(): string | null {
  const [photo, setPhoto] = React.useState<string | null>(null);
  React.useEffect(() => {
    setPhoto(loadProfilePhoto());
    const onChange = (e: Event) => setPhoto((e as CustomEvent<string | null>).detail ?? null);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  return photo;
}
