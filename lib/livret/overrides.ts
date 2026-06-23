import type { LivretOverrides } from "./types";

/* ============================================================================
   Fusion des overrides du livret scolaire. Partagé entre le store (fusion
   locale) et le write-through Supabase (calcul de l'état complet à persister),
   pour garantir une logique unique.

   Fusion profonde des sous-objets (identity, appreciation + distinctions,
   medicalStages PAR INDEX, extension) ; remplacement intégral des tableaux
   (parents, etabSuccessifs, diplomes) lorsque le patch les fournit.
   ========================================================================== */
export function mergeLivretOverrides(
  base: LivretOverrides | undefined,
  patch: LivretOverrides,
): LivretOverrides {
  const b = base ?? {};
  const out: LivretOverrides = { ...b, ...patch };
  if (b.identity || patch.identity) out.identity = { ...b.identity, ...patch.identity };
  if (b.appreciation || patch.appreciation) {
    out.appreciation = {
      ...b.appreciation,
      ...patch.appreciation,
      distinctions: { ...b.appreciation?.distinctions, ...patch.appreciation?.distinctions },
    };
  }
  if (b.medicalStages || patch.medicalStages) {
    // Fusion PAR INDEX (photo et observation d'une même étape ne s'écrasent pas).
    const merged: NonNullable<LivretOverrides["medicalStages"]> = { ...b.medicalStages };
    for (const [k, v] of Object.entries(patch.medicalStages ?? {})) {
      const i = Number(k);
      merged[i] = { ...merged[i], ...v };
    }
    out.medicalStages = merged;
  }
  if (b.extension || patch.extension) out.extension = { ...b.extension, ...patch.extension };
  return out;
}
