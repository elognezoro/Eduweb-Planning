"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  Wand2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/app-shell/app-context";
import { buildCsvTemplate } from "@/lib/imports/csv";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import {
  parseTabular,
  splitFullName,
  makeUsername,
  eduwebEmail,
  toCsv,
  slugLower,
  compact,
  type Tabular,
} from "@/lib/imports/excel-convert";

/* ---------- Modèle de colonne de sortie ---------- */
type ColKind =
  | "username"
  | "email"
  | "lastname"
  | "firstname"
  | "fullname"
  | "country"
  | "establishment"
  | "group"
  | "column"
  | "constant";

interface OutCol {
  id: string;
  header: string; // nom de colonne dans le CSV de sortie (libre)
  kind: ColKind;
  col?: number; // index de colonne source (kind "column")
  constant?: string; // valeur fixe (kind "constant")
}

const KIND_LABEL: Record<ColKind, string> = {
  username: "Nom d'utilisateur (auto ≤10)",
  email: "E-mail (username@eduweb.ci)",
  lastname: "NOM",
  firstname: "Prénoms",
  fullname: "NOM Prénoms",
  country: "Pays (indicateur)",
  establishment: "Établissement (indicateur)",
  group: "Groupe / TD",
  column: "Colonne du fichier…",
  constant: "Valeur fixe…",
};

/* ---------- Indicateurs composant le nom d'utilisateur ---------- */
type IndMode = "constant" | "column";
interface IndState {
  mode: IndMode;
  constant: string;
  col: number;
}
const ind = (constant = "", col = 0): IndState => ({ mode: "constant", constant, col });
/** Longueurs max de chaque partie dans l'indicateur (pour rester ≤ 10 car.). */
const IND_CAP = { country: 2, establishment: 3, group: 3 } as const;

function readInd(state: IndState, row: string[]): string {
  return state.mode === "column" ? (row[state.col] ?? "") : state.constant;
}

let _id = 0;
const nextId = () => `c${++_id}`;

/** Colonnes Moodle par défaut. */
function defaultColumns(): OutCol[] {
  return [
    { id: nextId(), header: "username", kind: "username" },
    { id: nextId(), header: "firstname", kind: "firstname" },
    { id: nextId(), header: "lastname", kind: "lastname" },
    { id: nextId(), header: "email", kind: "email" },
    { id: nextId(), header: "password", kind: "constant", constant: "" },
    { id: nextId(), header: "cohort1", kind: "country" },
    { id: nextId(), header: "course1", kind: "establishment" },
    { id: nextId(), header: "group1", kind: "group" },
    { id: nextId(), header: "role1", kind: "constant", constant: "student" },
  ];
}

function findCol(headers: string[], ...keys: string[]): number | undefined {
  const norm = headers.map((h) => slugLower(h));
  for (const k of keys) {
    const i = norm.findIndex((h) => h.includes(k));
    if (i >= 0) return i;
  }
  return undefined;
}

export default function ConvertisseurCsvPage() {
  const { country: appCountry } = useApp();
  const [data, setData] = React.useState<Tabular | null>(null);

  // Source des noms : une colonne combinée, ou deux colonnes séparées.
  const [nameMode, setNameMode] = React.useState<"one" | "two">("two");
  const [combinedCol, setCombinedCol] = React.useState(0);
  const [lastCol, setLastCol] = React.useState(0);
  const [firstCol, setFirstCol] = React.useState(1);

  // Indicateurs intégrés au nom d'utilisateur (pays · établissement · groupe).
  const [country, setCountry] = React.useState<IndState>(() => ind(slugLower(appCountry.code)));
  const [establishment, setEstablishment] = React.useState<IndState>(() => ind());
  const [group, setGroup] = React.useState<IndState>(() => ind());

  const [cols, setCols] = React.useState<OutCol[]>(() => defaultColumns());

  async function onFile(file: File) {
    const t = await parseTabular(file);
    if (t.headers.length === 0) {
      toast.error("Fichier vide ou illisible.");
      return;
    }
    setData(t);
    // Auto-détection des colonnes usuelles.
    const prenom = findCol(t.headers, "prenom", "firstname");
    const nom = t.headers.findIndex(
      (h, i) =>
        (slugLower(h).includes("nom") || slugLower(h).includes("lastname")) &&
        i !== prenom &&
        !slugLower(h).includes("prenom"),
    );
    const groupeCol = findCol(t.headers, "groupe", "group", "classe", "class", "td");
    const estabCol = findCol(t.headers, "etablissement", "ecole", "school", "estab", "lycee", "college");
    const paysCol = findCol(t.headers, "pays", "country");
    if (prenom !== undefined && prenom >= 0 && nom >= 0) {
      setNameMode("two");
      setLastCol(nom);
      setFirstCol(prenom);
    } else {
      setNameMode("one");
      setCombinedCol(nom >= 0 ? nom : 0);
    }
    if (groupeCol !== undefined) setGroup({ mode: "column", constant: "", col: groupeCol });
    if (estabCol !== undefined) setEstablishment({ mode: "column", constant: "", col: estabCol });
    if (paysCol !== undefined) setCountry({ mode: "column", constant: "", col: paysCol });
    setCols(defaultColumns());
  }

  /** Résout NOM / Prénoms + indicateurs (bruts + composés) d'une ligne source. */
  const resolveRow = React.useCallback(
    (row: string[]) => {
      let lastname = "";
      let firstname = "";
      if (nameMode === "two") {
        lastname = toNomCase(row[lastCol] ?? "");
        firstname = toPrenomCase(row[firstCol] ?? "");
      } else {
        const s = splitFullName(row[combinedCol] ?? "");
        lastname = toNomCase(s.lastname);
        firstname = toPrenomCase(s.firstname);
      }
      const countryRaw = readInd(country, row);
      const estabRaw = readInd(establishment, row);
      const groupRaw = readInd(group, row);
      // Indicateur compact : pays(≤2) + établissement(≤3) + groupe(≤3). compact()
      // préserve la lettre de classe finale (Tle A vs Tle D restent distincts).
      const indicator =
        compact(countryRaw, IND_CAP.country) +
        compact(estabRaw, IND_CAP.establishment) +
        compact(groupRaw, IND_CAP.group);
      return { lastname, firstname, countryRaw, estabRaw, groupRaw, indicator };
    },
    [nameMode, lastCol, firstCol, combinedCol, country, establishment, group],
  );

  /** Construit les lignes de sortie (username + e-mail uniques sur tout le lot). */
  const output = React.useMemo(() => {
    if (!data) return { headers: [] as string[], rows: [] as string[][] };
    const taken = new Set<string>();
    const headers = cols.map((c) => c.header || "colonne");
    const rows = data.rows.map((row) => {
      const { lastname, firstname, countryRaw, estabRaw, groupRaw, indicator } = resolveRow(row);
      const username = makeUsername(`${lastname}${firstname}`, indicator, taken);
      const email = eduwebEmail(username);
      const fullname = `${lastname} ${firstname}`.trim();
      return cols.map((c) => {
        switch (c.kind) {
          case "username":
            return username;
          case "email":
            return email;
          case "lastname":
            return lastname;
          case "firstname":
            return firstname;
          case "fullname":
            return fullname;
          case "country":
            return countryRaw;
          case "establishment":
            return estabRaw;
          case "group":
            return groupRaw;
          case "column":
            return c.col != null ? (row[c.col] ?? "") : "";
          case "constant":
            return c.constant ?? "";
        }
      });
    });
    return { headers, rows };
  }, [data, cols, resolveRow]);

  function patchCol(id: string, patch: Partial<OutCol>) {
    setCols((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function move(id: string, dir: -1 | 1) {
    setCols((cs) => {
      const i = cs.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cs.length) return cs;
      const next = [...cs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function exportCsv() {
    download(toCsv(output.headers, output.rows), "export.csv", "text/csv;charset=utf-8");
    toast.success("CSV généré", { description: `${output.rows.length} ligne(s).` });
  }

  return (
    <ModulePage
      title="Convertisseur CSV"
      description="Importez un fichier Excel ou CSV, configurez vos colonnes, et exportez un CSV (compatible Moodle)."
      icon={FileSpreadsheet}
      permission="system:convert_csv"
      actions={
        <Button
          variant="outline"
          onClick={() =>
            download(
              buildCsvTemplate(
                ["username", "firstname", "lastname", "email", "password", "group1", "role1"],
                [["cilmkof6a", "Koffi", "KOUAMÉ", "cilmkof6a@eduweb.ci", "", "6èmeA", "student"]],
              ),
              "modele-moodle.csv",
              "text/csv;charset=utf-8",
            )
          }
        >
          <Download className="h-4 w-4" /> Modèle Moodle
        </Button>
      }
    >
      {!data ? (
        <SectionCard>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-ew-green-50/40 px-4 py-12 text-center transition-colors hover:border-ew-green-600 sm:py-14">
            <UploadCloud className="mb-3 h-10 w-10 text-ew-green-600" />
            <span className="font-semibold text-foreground">
              Déposez votre fichier Excel (.xlsx) ou CSV
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Les NOM/Prénoms peuvent être dans une seule colonne ou deux colonnes.
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Configuration */}
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Source des noms" description="Comment lire NOM et Prénoms du fichier.">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <ModeChip active={nameMode === "two"} onClick={() => setNameMode("two")}>
                    Deux colonnes (NOM / Prénoms)
                  </ModeChip>
                  <ModeChip active={nameMode === "one"} onClick={() => setNameMode("one")}>
                    Une seule colonne
                  </ModeChip>
                </div>
                {nameMode === "two" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ColSelect label="Colonne NOM" headers={data.headers} value={lastCol} onChange={setLastCol} />
                    <ColSelect label="Colonne Prénoms" headers={data.headers} value={firstCol} onChange={setFirstCol} />
                  </div>
                ) : (
                  <ColSelect label="Colonne « NOM Prénoms »" headers={data.headers} value={combinedCol} onChange={setCombinedCol} />
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Indicateurs du nom d'utilisateur"
              description="Le username (≤ 10 car.) encode pays · établissement · groupe ; l'e-mail devient username@eduweb.ci."
            >
              <div className="space-y-4">
                <IndicatorRow label="Pays" hint="ex. ci, al" headers={data.headers} state={country} onChange={setCountry} />
                <IndicatorRow label="Établissement" hint="ex. lm (code court)" headers={data.headers} state={establishment} onChange={setEstablishment} />
                <IndicatorRow label="Groupe / TD" hint="ex. 6a, td3, tle" headers={data.headers} state={group} onChange={setGroup} />
              </div>
              <p className="mt-3 rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                Exemple : NOM « KOUAMÉ », pays <b>ci</b>, établissement <b>lm</b>, groupe <b>6a</b> →
                username <b>cilmkof6a</b> (borné à 10 car.), e-mail <b>cilmkof6a@eduweb.ci</b>. En cas
                de doublon : <b>…1</b>, <b>…2</b>…
              </p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setData(null)}>
                Changer de fichier
              </Button>
            </SectionCard>
          </div>

          {/* Colonnes de sortie + aperçu */}
          <div className="space-y-6 lg:col-span-3">
            <SectionCard
              title="Colonnes du CSV de sortie"
              description="Renommez, réordonnez, ajoutez ou supprimez les colonnes."
            >
              <div className="space-y-2">
                {cols.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2"
                  >
                    <Input
                      value={c.header}
                      onChange={(e) => patchCol(c.id, { header: e.target.value })}
                      placeholder="nom de colonne"
                      className="h-8 w-32 font-mono text-xs"
                    />
                    <Select value={c.kind} onValueChange={(v) => patchCol(c.id, { kind: v as ColKind })}>
                      <SelectTrigger className="h-8 w-44 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(KIND_LABEL) as ColKind[]).map((k) => (
                          <SelectItem key={k} value={k} className="text-xs">
                            {KIND_LABEL[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {c.kind === "column" ? (
                      <Select
                        value={String(c.col ?? "")}
                        onValueChange={(v) => patchCol(c.id, { col: Number(v) })}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue placeholder="colonne source" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.headers.map((h, idx) => (
                            <SelectItem key={idx} value={String(idx)} className="text-xs">
                              {h || `col ${idx + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : c.kind === "constant" ? (
                      <Input
                        value={c.constant ?? ""}
                        onChange={(e) => patchCol(c.id, { constant: e.target.value })}
                        placeholder="valeur fixe"
                        className="h-8 w-36 text-xs"
                      />
                    ) : null}
                    <div className="ml-auto flex items-center gap-0.5">
                      <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => move(c.id, -1)} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Descendre" disabled={i === cols.length - 1} onClick={() => move(c.id, 1)} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Supprimer" onClick={() => setCols((cs) => cs.filter((x) => x.id !== c.id))} className="rounded p-1 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setCols((cs) => [...cs, { id: nextId(), header: "colonne", kind: "constant", constant: "" }])}>
                  <Plus className="h-4 w-4" /> Ajouter une colonne
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCols(defaultColumns())}>
                  <RotateCcw className="h-4 w-4" /> Modèle Moodle
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Aperçu" description={`${output.rows.length} ligne(s) — 20 premières affichées`}>
              <div className="max-h-72 overflow-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-ew-green-700 text-white">
                    <tr>
                      {output.headers.map((h, i) => (
                        <th key={i} className="whitespace-nowrap px-2 py-1.5 text-left font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {output.rows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {r.map((v, j) => (
                          <td key={j} className="whitespace-nowrap px-2 py-1.5 text-muted-foreground">
                            {v || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex justify-end">
                <Button onClick={exportCsv} disabled={output.rows.length === 0}>
                  <Wand2 className="h-4 w-4" /> Exporter le CSV
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </ModulePage>
  );
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ModeChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        active ? "border-ew-green-600 bg-ew-green-600 text-white" : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function IndicatorRow({
  label,
  hint,
  headers,
  state,
  onChange,
}: {
  label: string;
  hint: string;
  headers: string[];
  state: IndState;
  onChange: (s: IndState) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-semibold">{label}</Label>
        <div className="flex gap-1">
          <ModeChip active={state.mode === "constant"} onClick={() => onChange({ ...state, mode: "constant" })}>
            Valeur
          </ModeChip>
          <ModeChip active={state.mode === "column"} onClick={() => onChange({ ...state, mode: "column" })}>
            Colonne
          </ModeChip>
        </div>
      </div>
      {state.mode === "constant" ? (
        <Input
          value={state.constant}
          onChange={(e) => onChange({ ...state, constant: e.target.value })}
          placeholder={hint}
          className="h-8 text-xs"
        />
      ) : (
        <Select value={String(state.col)} onValueChange={(v) => onChange({ ...state, col: Number(v) })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {headers.map((h, i) => (
              <SelectItem key={i} value={String(i)} className="text-xs">
                {h || `colonne ${i + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function ColSelect({
  label,
  headers,
  value,
  onChange,
}: {
  label: string;
  headers: string[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {headers.map((h, i) => (
            <SelectItem key={i} value={String(i)}>
              {h || `colonne ${i + 1}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
