"use client";

import * as React from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { CoursePayment } from "@/lib/formations/payment";
import type { ModuleCompletion, CourseCompletion } from "@/lib/formations/types";
import {
  fetchCoursePayments,
  upsertCoursePayment,
  deleteCoursePayment,
  fetchModuleCompletions,
  upsertModuleCompletion,
  deleteModuleCompletion,
  fetchCourseCompletions,
  upsertCourseCompletion,
  deleteCourseCompletion,
} from "@/lib/formations/progression-server";

const REAL_MODE = isSupabaseConfigured();

/**
 * Réconcilie une slice par-utilisateur avec le serveur : upsert des lignes
 * nouvelles/modifiées, suppression de celles disparues localement (unmark…).
 * `known` = dernier état CONFIRMÉ côté serveur (mis à jour seulement au succès)
 * → pas d'écrasement ni de re-push inutile.
 */
function reconcile<T extends { id: string }>(
  sb: SupabaseClient,
  rows: T[],
  known: Map<string, T>,
  upsert: (sb: SupabaseClient, r: T) => Promise<{ ok: boolean }>,
  del: (sb: SupabaseClient, r: T) => Promise<{ ok: boolean }>,
) {
  const curIds = new Set(rows.map((r) => r.id));
  for (const r of rows) {
    const prev = known.get(r.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(r)) {
      void upsert(sb, r).then((res) => {
        if (res.ok) known.set(r.id, r);
      });
    }
  }
  for (const [id, prevRow] of [...known.entries()]) {
    if (!curIds.has(id)) {
      void del(sb, prevRow).then((res) => {
        if (res.ok) known.delete(id);
      });
    }
  }
}

const delPay = (sb: SupabaseClient, p: CoursePayment) => deleteCoursePayment(sb, p.id);
const delMod = (sb: SupabaseClient, m: ModuleCompletion) => deleteModuleCompletion(sb, m);
const delCrs = (sb: SupabaseClient, c: CourseCompletion) => deleteCourseCompletion(sb, c);

/**
 * Synchronise la PROGRESSION APPRENANT par utilisateur (paiements, complétions
 * de module, réussites de cours) avec Supabase :
 *  - chargement au montage (RLS : les siennes, ou tout si admin) → fusion store ;
 *  - write-through par réconciliation (upsert / delete), activé UNIQUEMENT après
 *    un chargement serveur confirmé (anti-écrasement par le cache local).
 *  - Mode démo (!REAL_MODE) : no-op (localStorage inchangé).
 */
export function ProgressionSync() {
  const app = useApp();
  const store = useStore();
  const [loaded, setLoaded] = React.useState(false);
  const payRef = React.useRef<Map<string, CoursePayment>>(new Map());
  const modRef = React.useRef<Map<string, ModuleCompletion>>(new Map());
  const crsRef = React.useRef<Map<string, CourseCompletion>>(new Map());

  // 1) Chargement (serveur = autorité, fusion par id).
  React.useEffect(() => {
    if (!REAL_MODE || !app.user.id || loaded) return;
    let active = true;
    (async () => {
      try {
        const sb = createClient();
        const [pays, mods, crs] = await Promise.all([
          fetchCoursePayments(sb),
          fetchModuleCompletions(sb),
          fetchCourseCompletions(sb),
        ]);
        if (!active) return;
        store.mergeCoursePayments(pays);
        store.mergeModuleCompletions(mods);
        store.mergeCourseCompletions(crs);
        for (const p of pays) payRef.current.set(p.id, p);
        for (const m of mods) modRef.current.set(m.id, m);
        for (const c of crs) crsRef.current.set(c.id, c);
        setLoaded(true);
      } catch {
        /* échec : write-through laissé désactivé (anti-écrasement) */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.user.id]);

  // 2) Write-through par slice (après chargement confirmé).
  React.useEffect(() => {
    if (!REAL_MODE || !loaded) return;
    reconcile(createClient(), store.coursePayments, payRef.current, upsertCoursePayment, delPay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, store.coursePayments]);

  React.useEffect(() => {
    if (!REAL_MODE || !loaded) return;
    reconcile(createClient(), store.moduleCompletions, modRef.current, upsertModuleCompletion, delMod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, store.moduleCompletions]);

  React.useEffect(() => {
    if (!REAL_MODE || !loaded) return;
    reconcile(createClient(), store.courseCompletions, crsRef.current, upsertCourseCompletion, delCrs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, store.courseCompletions]);

  return null;
}
