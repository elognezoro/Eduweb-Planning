"use client";

import * as React from "react";
import { toast } from "sonner";
import { useApp } from "./app-context";
import { useScopedEstablishmentId } from "./use-scoped-establishment";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { ELEVES } from "@/lib/mock-data";
import {
  bulkInsertStudents,
  fetchStudents,
  insertStudent,
  setStudentStatus,
  updateStudent,
  type Student,
  type StudentInput,
} from "@/lib/students/students-server";

/* ============================================================================
   Source de données « élèves » en double mode.
   - Mode réel (Supabase) : lit/écrit la table `eleves` (RLS cloisonnée par
     établissement) ; les créations sont rattachées à l'établissement de
     l'utilisateur courant.
   - Mode démo : élèves simulés (ELEVES), mutations en mémoire.
   ========================================================================== */

const REAL_MODE = isSupabaseConfigured();

function mockStudents(): Student[] {
  return ELEVES.map((e) => ({
    id: e.id,
    matricule: e.matricule,
    firstName: e.firstName,
    lastName: e.lastName,
    gender: e.gender,
    birthDate: e.birthDate,
    birthPlace: "",
    className: e.className,
    status: e.status === "suspended" ? "archived" : "active",
    etablissementId: null,
  }));
}

export interface UseStudentsValue {
  students: Student[];
  loading: boolean;
  realMode: boolean;
  refresh: () => void;
  addStudent: (input: StudentInput) => Promise<{ ok: boolean; error?: string }>;
  updateStudent: (id: string, patch: Partial<StudentInput>) => Promise<{ ok: boolean; error?: string }>;
  setStatus: (id: string, status: "active" | "archived") => Promise<void>;
  importStudents: (inputs: StudentInput[]) => Promise<{ inserted: number; failed: number; error?: string }>;
}

export function useStudents(): UseStudentsValue {
  const app = useApp();
  // Portée d'affichage : établissement réel de l'admin, OU celui de l'utilisateur
  // simulé pendant un aperçu. Pilote la lecture (masque) ET les créations.
  const etabId = useScopedEstablishmentId();
  const [students, setStudents] = React.useState<Student[]>(() => (REAL_MODE ? [] : mockStudents()));
  const [loading, setLoading] = React.useState(REAL_MODE);

  const refresh = React.useCallback(async () => {
    if (!REAL_MODE) return;
    // Masque de lecture appliqué UNIQUEMENT en aperçu (hors aperçu : statu quo,
    // le RLS sert déjà la bonne portée à l'admin et aux vrais rôles).
    if (app.isImpersonating) {
      if (etabId === null) {
        // Aperçu d'un utilisateur sans établissement → vue volontairement vide.
        setStudents([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        setStudents(await fetchStudents(createClient(), etabId));
      } catch {
        toast.error("Chargement des élèves impossible");
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      setStudents(await fetchStudents(createClient()));
    } catch {
      toast.error("Chargement des élèves impossible");
    } finally {
      setLoading(false);
    }
  }, [etabId, app.isImpersonating]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const value: UseStudentsValue = REAL_MODE
    ? {
        students,
        loading,
        realMode: true,
        refresh: () => void refresh(),
        addStudent: async (input) => {
          const res = await insertStudent(createClient(), input, etabId);
          if (res.ok && res.student) setStudents((s) => [...s, res.student!].sort((a, b) => a.lastName.localeCompare(b.lastName)));
          return { ok: res.ok, error: res.error };
        },
        updateStudent: async (id, patch) => {
          const res = await updateStudent(createClient(), id, patch);
          if (res.ok) setStudents((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
          return res;
        },
        setStatus: async (id, status) => {
          const ok = await setStudentStatus(createClient(), id, status);
          if (ok) setStudents((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));
          else toast.error("Mise à jour du statut impossible");
        },
        importStudents: async (inputs) => {
          const res = await bulkInsertStudents(createClient(), inputs, etabId);
          if (res.inserted.length > 0) {
            setStudents((s) => [...s, ...res.inserted].sort((a, b) => a.lastName.localeCompare(b.lastName)));
          }
          return { inserted: res.inserted.length, failed: res.failed, error: res.error };
        },
      }
    : {
        students,
        loading: false,
        realMode: false,
        refresh: () => {},
        addStudent: async (input) => {
          setStudents((s) => [
            ...s,
            { ...input, id: `elv-local-${s.length + 1}-${input.matricule || input.lastName}`, status: "active", etablissementId: null },
          ]);
          return { ok: true };
        },
        updateStudent: async (id, patch) => {
          setStudents((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
          return { ok: true };
        },
        setStatus: async (id, status) => {
          setStudents((s) => s.map((x) => (x.id === id ? { ...x, status } : x)));
        },
        importStudents: async (inputs) => {
          setStudents((s) => [
            ...s,
            ...inputs.map((input, i) => ({
              ...input,
              id: `elv-import-${s.length + i}-${input.matricule || input.lastName}`,
              status: "active",
              etablissementId: null,
            })),
          ]);
          return { inserted: inputs.length, failed: 0 };
        },
      };

  return value;
}
