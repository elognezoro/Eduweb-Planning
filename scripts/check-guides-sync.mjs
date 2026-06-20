#!/usr/bin/env node
/* ============================================================================
   Contrôle de cohérence des GUIDES UTILISATEURS avec le SYSTÈME.

   Les listes système (formations, rôles, supports) sont déjà injectées
   AUTOMATIQUEMENT au rendu via lib/guides/dynamic-facts.ts (bloc « catalogue
   à jour »). Ce script vérifie le reste :

   1. Chaque guide par rôle possède bien le chapitre « centre-formation »
      (point d'ancrage du bloc auto-injecté). Sans lui, le catalogue à jour
      n'apparaît pas → ERREUR (exit 1).
   2. Aucun guide ne CODE EN DUR un nombre de séminaires obsolète (ex.
      « 3 séminaires » alors que le catalogue en compte un autre nombre)
      → AVERTISSEMENT.
   3. Signale les séminaires du catalogue jamais nommés dans un guide
      (le bloc auto-injecté les couvre, mais la prose peut être à revoir)
      → INFO.

   Usage : node scripts/check-guides-sync.mjs
   Pensé pour tourner via un hook Claude Code à chaque modification d'un
   fichier impactant (catalogue, rôles, supports, séminaires, guides).
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

/* ---- 1. Séminaires actuellement au catalogue ---- */
function seminairesFromCatalog() {
  const src = read("lib/formations/catalog.ts");
  const result = [];
  // Découpe en entrées de cours : « { ... id: "x" ... } ».
  const entryRe =
    /id:\s*"([^"]+)"[\s\S]*?type:\s*"([^"]+)"[\s\S]*?shortTitle:\s*"([^"]+)"/g;
  let m;
  while ((m = entryRe.exec(src)) !== null) {
    const [, id, type, shortTitle] = m;
    if (type === "seminaire") result.push({ id, shortTitle });
  }
  return result;
}

/* ---- 2. Rôles de formation ---- */
function formationRoles() {
  const src = read("lib/formations/formation-roles.ts");
  const m = src.match(/FORMATION_ROLES\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

const GUIDE_FILES = [
  "admin",
  "chef_etablissement",
  "enseignant",
  "educateur",
  "conseiller_pedagogique",
  "inspecteur",
  "parent",
  "eleve",
];

export function runCheck() {
  const seminaires = seminairesFromCatalog();
  const roles = formationRoles();
  const count = seminaires.length;

  const errors = [];
  const warnings = [];
  const infos = [];

  console.log(
    `Catalogue : ${count} séminaire(s) — ${seminaires.map((s) => s.shortTitle).join(", ")}`,
  );
  console.log(`Rôles de formation : ${roles.join(" > ")}`);

  for (const key of GUIDE_FILES) {
    const rel = `lib/guides/${key}.ts`;
    let src;
    try {
      src = read(rel);
    } catch {
      errors.push(`${rel} introuvable.`);
      continue;
    }

    // (1) Ancre du bloc auto-injecté.
    if (!/id:\s*"centre-formation"/.test(src)) {
      errors.push(
        `${rel} : chapitre « centre-formation » absent → le catalogue à jour ne sera pas injecté.`,
      );
    }

    // (2) Nombre de séminaires codé en dur et obsolète.
    const hardCount = [...src.matchAll(/(\d+)\s+séminaires?\b/gi)].map((x) =>
      Number(x[1]),
    );
    for (const n of hardCount) {
      if (n !== count) {
        warnings.push(
          `${rel} : mention « ${n} séminaires » en dur alors que le catalogue en compte ${count}. Préférer le bloc auto-injecté ou le jeton {{FORMATIONS_COUNT}}.`,
        );
      }
    }

    // (3) Séminaires jamais nommés dans le guide.
    for (const s of seminaires) {
      const head = s.shortTitle.split(/[ (]/)[0]; // premier mot significatif
      if (head.length >= 4 && !src.includes(head)) {
        infos.push(
          `${rel} : séminaire « ${s.shortTitle} » non nommé (couvert par le bloc auto).`,
        );
      }
    }
  }

  if (infos.length) {
    console.log("\nINFO :");
    infos.forEach((i) => console.log("  · " + i));
  }
  if (warnings.length) {
    console.log("\n⚠ AVERTISSEMENTS :");
    warnings.forEach((w) => console.log("  - " + w));
  }
  if (errors.length) {
    console.log("\n✗ ERREURS :");
    errors.forEach((e) => console.log("  - " + e));
  } else {
    console.log(
      warnings.length
        ? "\nGuides cohérents (listes système auto-injectées). Avertissements ci-dessus à revoir si besoin."
        : "\n✓ Guides cohérents : listes système auto-injectées, aucun écart détecté.",
    );
  }
  return { errors, warnings, infos };
}

// Exécution directe (CLI) : node scripts/check-guides-sync.mjs [--soft]
// Sans --soft : sort en code 1 si une ERREUR structurelle est détectée
// (utile en vérification manuelle / CI). Avec --soft : n'échoue jamais
// (utilisé en prebuild pour ne pas bloquer un déploiement sur une heuristique).
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  const soft = process.argv.includes("--soft");
  const { errors } = runCheck();
  if (errors.length && !soft) process.exitCode = 1;
}
