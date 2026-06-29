"use client";

import * as React from "react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore, type DeliveredCertificate } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  fetchCertificates,
  insertCertificate,
  deleteCertificate,
} from "@/lib/certificates/certificates-server";

const REAL_MODE = isSupabaseConfigured();

/**
 * Persiste le JOURNAL des certificats délivrés par établissement (migration 045)
 * → traçabilité partagée et reprise sur tous les postes (au lieu d'un journal
 * localStorage divergent). La NUMÉROTATION atomique est gérée séparément par la
 * RPC next_certificate_number (cf. page certificat).
 *
 * - Chargement au montage : serveur = autorité (REMPLACE les seeds locaux).
 * - Write-through par DIFF : insertion des nouveaux certificats, suppression de
 *   ceux retirés localement (un certificat délivré n'est jamais modifié).
 */
export function CertificatesSync() {
  const app = useApp();
  const etablissementId = app.user.etablissementId || null;
  const { certificates, setCertificatesFromServer } = useStore();
  const [loaded, setLoaded] = React.useState(false);
  const knownRef = React.useRef<Map<string, DeliveredCertificate>>(new Map());

  // 1) Chargement (serveur = autorité).
  React.useEffect(() => {
    if (!REAL_MODE || !app.user.id || !etablissementId || loaded) return;
    let active = true;
    (async () => {
      try {
        const rows = await fetchCertificates(createClient());
        if (!active) return;
        setCertificatesFromServer(rows);
        knownRef.current = new Map(rows.map((r) => [r.id, r]));
        setLoaded(true);
      } catch {
        /* échec : write-through laissé désactivé (anti-écrasement) */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.user.id, etablissementId]);

  // 2) Write-through (après chargement) : insert nouveaux / delete retirés.
  React.useEffect(() => {
    if (!REAL_MODE || !etablissementId || !loaded) return;
    const sb = createClient();
    const known = knownRef.current;
    const curIds = new Set(certificates.map((c) => c.id));
    for (const c of certificates) {
      if (!known.has(c.id)) {
        void insertCertificate(sb, c, etablissementId, app.user.id).then((res) => {
          if (res.ok) known.set(c.id, c);
        });
      }
    }
    for (const [id] of [...known.entries()]) {
      if (!curIds.has(id)) {
        void deleteCertificate(sb, id).then((res) => {
          if (res.ok) known.delete(id);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, certificates, etablissementId, app.user.id]);

  return null;
}
