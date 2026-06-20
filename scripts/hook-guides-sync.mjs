#!/usr/bin/env node
/* ============================================================================
   Wrapper de hook Claude Code (PostToolUse).

   Lit le JSON du hook sur stdin, repère le fichier modifié, et n'exécute le
   contrôle de cohérence des guides (check-guides-sync) QUE si ce fichier
   impacte les guides : catalogue des formations, rôles de formation,
   supports, données de séminaires, ou les guides eux-mêmes.

   Ainsi, à chaque modification pertinente du système, le développeur est
   averti si la PROSE d'un guide risque d'être obsolète (les LISTES, elles,
   sont déjà mises à jour automatiquement au rendu via dynamic-facts.ts).

   Sortie silencieuse (exit 0) pour toute autre modification.
   ========================================================================== */

import { runCheck } from "./check-guides-sync.mjs";

const IMPACTING = [
  /lib[\\/]formations[\\/]catalog\.ts$/,
  /lib[\\/]formations[\\/]formation-roles\.ts$/,
  /lib[\\/]formations[\\/]support-access\.ts$/,
  /lib[\\/]seminaires[\\/].+\.ts$/,
  /lib[\\/]guides[\\/].+\.ts$/,
];

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) return resolve("");
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    // Filet de sécurité si stdin ne se ferme pas.
    setTimeout(() => resolve(data), 400);
  });
}

const raw = await readStdin();
let filePath = "";
try {
  const json = JSON.parse(raw || "{}");
  filePath = json?.tool_input?.file_path || json?.tool_input?.path || "";
} catch {
  filePath = "";
}

if (!filePath || !IMPACTING.some((re) => re.test(filePath))) {
  process.exit(0);
}

console.log(
  `[guides-sync] « ${filePath} » impacte le Centre de formation — vérification des guides :`,
);
const { errors, warnings } = runCheck();
if (!errors.length && !warnings.length) {
  console.log(
    "[guides-sync] Les guides restent à jour automatiquement (listes dérivées). Rien à faire.",
  );
}
// Ne bloque jamais le flux de travail : on informe sans échouer.
process.exit(0);
