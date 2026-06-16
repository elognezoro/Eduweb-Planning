"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  BellRing,
  MessageSquare,
  Mail,
  Bell,
  MessageCircle,
  Send,
  Pencil,
  Trash2,
  Search,
  UploadCloud,
  Plus,
  HelpCircle,
  Save,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { ModulePage } from "@/components/modules/module-page";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImportCsvDialog } from "@/components/forms/import-csv-dialog";
import { PremiumGate } from "@/components/premium/premium-gate";
import { cn } from "@/lib/utils";

/* --------------------------------- Données ---------------------------------- */
interface Contact {
  eleve: string;
  classe: string;
  parent: string;
  tel: string;
  email: string;
}
const INITIAL_CONTACTS: Contact[] = [
  { eleve: "Kouadio Aya", classe: "5ème 1", parent: "KOUADIO Daniel", tel: "+225 07 08 09 10 11", email: "daniel.kouadio@email.ci" },
  { eleve: "Traoré Moussa", classe: "5ème 1", parent: "TRAORÉ Mariam", tel: "+225 05 12 34 56 78", email: "mariam.traore@email.ci" },
  { eleve: "Koné Fatou", classe: "5ème 1", parent: "KONÉ Amadou", tel: "+225 01 23 45 67 89", email: "amadou.kone@email.ci" },
  { eleve: "Bamba Ibrahim", classe: "5ème 1", parent: "BAMBA Fatoumata", tel: "+225 07 66 77 88 99", email: "fatoumata.bamba@email.ci" },
  { eleve: "Diallo Aminata", classe: "5ème 1", parent: "DIALLO Souleymane", tel: "+225 05 33 22 11 00", email: "souleymane.diallo@email.ci" },
  { eleve: "Yao Koffi", classe: "5ème 2", parent: "YAO Kouamé", tel: "+225 07 11 00 22 33", email: "—" },
];

const PROVIDERS = [
  { id: "orange", name: "Orange CI (SMS Pro)" },
  { id: "mtn", name: "MTN CI (Bulk SMS)" },
  { id: "moov", name: "Moov Africa" },
  { id: "twilio", name: "Twilio (international)" },
];

const CHANNELS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "sms", label: "SMS automatique (Orange CI / MTN)", icon: MessageSquare },
  { id: "email", label: "Email récapitulatif hebdomadaire", icon: Mail },
  { id: "inapp", label: "Notification in-app", icon: Bell },
  { id: "whatsapp", label: "WhatsApp (API tierce)", icon: MessageCircle },
];

const DEFAULT_TEMPLATES = {
  retard: "Bonjour {NOM_PARENT}, votre enfant {PRENOM} ({CLASSE}) a cumulé {NB} retard(s) consécutif(s). Merci de veiller à la ponctualité. Contact : {TEL_ETAB}",
  absence: "Bonjour {NOM_PARENT}, votre enfant {PRENOM} ({CLASSE}) a cumulé {NB} absence(s) consécutive(s). Merci de nous contacter. Contact : {TEL_ETAB}",
  notes: "Bonjour {NOM_PARENT}, les notes de {PRENOM} ({CLASSE}) pour le trimestre sont disponibles. Consultez-les sur EduWeb Planner. Contact : {TEL_ETAB}",
};

const JOURNAL: { date: string; type: string; dest: string; msg: string }[] = [
  { date: "20/06/2026 08:31:12", type: "alerte_retard", dest: "+225 0708091011", msg: "[Lycée Cocody] Bonjour KOUADIO Daniel, votre enfant Aya (5ème 1) a cumulé 2 retard(s) consécutif(s)…" },
  { date: "20/06/2026 09:02:44", type: "alerte_absence", dest: "+225 0512345678", msg: "[Lycée Cocody] Bonjour TRAORÉ Mariam, votre enfant Moussa (5ème 1) a cumulé 3 absence(s) consécutive(s)…" },
  { date: "19/06/2026 16:20:08", type: "publication_notes", dest: "+225 0123456789", msg: "[Lycée Cocody] Bonjour KONÉ Amadou, les notes de Fatou (5ème 1) sont disponibles…" },
  { date: "19/06/2026 11:45:33", type: "alerte_retard", dest: "+225 0766778899", msg: "[Lycée Cocody] Bonjour BAMBA Fatoumata, votre enfant Ibrahim (5ème 1) a cumulé 2 retard(s)…" },
  { date: "18/06/2026 14:10:51", type: "alerte_absence", dest: "+225 0533221100", msg: "[Lycée Cocody] Bonjour DIALLO Souleymane, votre enfant Aminata (5ème 1) a cumulé 4 absence(s)…" },
  { date: "18/06/2026 08:05:27", type: "publication_notes", dest: "+225 0711002233", msg: "[Lycée Cocody] Bonjour YAO Kouamé, les notes de Koffi (5ème 2) sont disponibles…" },
  { date: "17/06/2026 17:32:09", type: "alerte_retard", dest: "+225 0708091011", msg: "[Lycée Cocody] Bonjour KOUADIO Daniel, votre enfant Aya (5ème 1) a cumulé 3 retard(s)…" },
  { date: "17/06/2026 10:18:40", type: "publication_notes", dest: "+225 0512345678", msg: "[Lycée Cocody] Bonjour TRAORÉ Mariam, les notes de Moussa (5ème 1) sont disponibles…" },
  { date: "16/06/2026 15:54:02", type: "alerte_absence", dest: "+225 0123456789", msg: "[Lycée Cocody] Bonjour KONÉ Amadou, votre enfant Fatou (5ème 1) a cumulé 3 absence(s)…" },
];

const typeTone = (t: string): "blue" | "red" | "gold" => (t === "publication_notes" ? "blue" : t === "alerte_absence" ? "red" : "gold");

function Card({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <div id={id} className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5", id && "scroll-mt-24", className)}>{children}</div>;
}

function Slider({ label, value, onChange, min, max, help }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; help?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-foreground">
          {label}
          {help && (
            <span title={help} className="cursor-help">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
        </span>
        <span className="text-sm font-bold text-ew-green-700">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ew-green-700"
      />
    </div>
  );
}

export default function AlertesSmsPage() {
  const t = useTranslations();
  const [alertsOn, setAlertsOn] = React.useState(true);
  const [thresholds, setThresholds] = React.useState({ retards: 5, absences: 3, note: 8 });
  const [channels, setChannels] = React.useState<Record<string, boolean>>({ sms: true, email: true, inapp: true, whatsapp: false });
  const [provider, setProvider] = React.useState("orange");
  const [templates, setTemplates] = React.useState(DEFAULT_TEMPLATES);
  const [contacts, setContacts] = React.useState<Contact[]>(INITIAL_CONTACTS);
  const [query, setQuery] = React.useState("");

  const filtered = contacts.filter((c) =>
    `${c.eleve} ${c.classe} ${c.parent} ${c.tel} ${c.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const fill = (text: string, c: Contact) =>
    text
      .replace(/\{NOM_PARENT\}/g, c.parent)
      .replace(/\{PRENOM\}/g, c.eleve.split(" ").slice(1).join(" ") || c.eleve)
      .replace(/\{CLASSE\}/g, c.classe)
      .replace(/\{NB\}/g, "2")
      .replace(/\{TEL_ETAB\}/g, "+225 27 22 44 55 66");

  const testSend = (key: keyof typeof templates) => {
    toast.message("Aperçu de l'envoi (test)", { description: fill(templates[key], contacts[0]) });
  };

  const TEMPLATE_BLOCKS: { key: keyof typeof templates; label: string }[] = [
    { key: "retard", label: "Alerte retard" },
    { key: "absence", label: "Alerte absence" },
    { key: "notes", label: "Publication notes" },
  ];

  return (
    <ModulePage title={t("pages.vieScolaireAlertesSms.title")} description={t("pages.vieScolaireAlertesSms.description")}
      icon={BellRing}
      permission="sms:view"
      sections={[
        { id: "seuils", label: "Seuils & canaux" },
        { id: "modeles", label: "Modèles SMS" },
        { id: "contacts", label: "Contacts parents" },
        { id: "journal", label: "Journal SMS" },
      ]}
    >
      <PremiumGate
        feature="Alertes SMS automatiques"
        description="Les notifications SMS automatiques aux parents font partie de l'offre Premium. Souscrivez pour activer l'envoi réel."
      >
      {/* Seuils d'alerte + Canaux de diffusion */}
      <div id="seuils" className="scroll-mt-24 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Seuils d&apos;alerte</h2>
            <Switch checked={alertsOn} onCheckedChange={setAlertsOn} aria-label="Activer les alertes" />
          </div>
          <div className={cn("mt-4 space-y-4", !alertsOn && "pointer-events-none opacity-50")}>
            <Slider label="Retards consécutifs" value={thresholds.retards} min={1} max={10} onChange={(v) => setThresholds((t) => ({ ...t, retards: v }))} />
            <Slider label="Absences consécutives" value={thresholds.absences} min={1} max={10} onChange={(v) => setThresholds((t) => ({ ...t, absences: v }))} />
            <Slider
              label="Note seuil (/20)"
              value={thresholds.note}
              min={0}
              max={20}
              help="Une alerte est envoyée si la moyenne passe sous ce seuil."
              onChange={(v) => setThresholds((t) => ({ ...t, note: v }))}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-foreground">Canaux de diffusion</h2>
          <div className="mt-3 space-y-2.5">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              return (
                <div key={ch.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Icon className="h-4 w-4 text-muted-foreground" /> {ch.label}
                  </span>
                  <Switch checked={channels[ch.id]} onCheckedChange={(v) => setChannels((c) => ({ ...c, [ch.id]: v }))} aria-label={ch.label} />
                </div>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Fournisseur SMS</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Modèles SMS personnalisables */}
      <Card id="modeles">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-foreground">Modèles SMS personnalisables</h2>
          <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            Variables : {"{NOM_PARENT} {PRENOM} {CLASSE} {NB} {TEL_ETAB}"}
          </span>
        </div>
        <div className="mt-4 space-y-4">
          {TEMPLATE_BLOCKS.map((b) => (
            <div key={b.key}>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{b.label}</p>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Textarea
                rows={2}
                value={templates[b.key]}
                onChange={(e) => setTemplates((t) => ({ ...t, [b.key]: e.target.value }))}
                className="text-sm"
              />
              <Button variant="outline" size="sm" className="mt-2" onClick={() => testSend(b.key)}>
                <Send className="h-4 w-4" /> Tester l&apos;envoi
              </Button>
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={() => toast.success("Paramètres enregistrés", { description: "Seuils, canaux et modèles SMS mis à jour." })}>
          <Save className="h-4 w-4" /> Enregistrer les paramètres
        </Button>
      </Card>

      {/* Contacts parents d'élèves */}
      <Card id="contacts" className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            Contacts parents d&apos;élèves
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ew-green-100 px-1.5 text-xs font-bold text-ew-green-700">
              {contacts.length}
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…" className="h-9 w-44 pl-8" />
            </div>
            <ImportCsvDialog
              title="Importer des contacts parents"
              description="Une ligne par contact : Élève ; Classe ; Parent ; Téléphone ; Email."
              expectedColumns={["eleve", "classe", "parent", "telephone", "email"]}
              sampleRow={["Kouadio Aya", "5ème 1", "KOUADIO Daniel", "+225 07 08 09 10 11", "daniel.kouadio@email.ci"]}
              templateFilename="modele-contacts-parents.csv"
              trigger={(open) => (
                <Button variant="outline" size="sm" onClick={open}>
                  <UploadCloud className="h-4 w-4" /> Importer CSV
                </Button>
              )}
            />
            <AddContactDialog onAdd={(c) => setContacts((cs) => [c, ...cs])} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Élève</th>
                <th className="px-4 py-2.5 text-left">Classe</th>
                <th className="px-4 py-2.5 text-left">Parent</th>
                <th className="px-4 py-2.5 text-left">Téléphone</th>
                <th className="px-4 py-2.5 text-left">Email</th>
                <th className="px-4 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={`${c.eleve}-${i}`} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.eleve}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.classe}</td>
                  <td className="px-4 py-2.5">{c.parent}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ew-green-700">{c.tel}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => setContacts((cs) => cs.filter((x) => x !== c))}
                      className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      aria-label={`Supprimer ${c.eleve}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Aucun contact trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Journal SMS (mock) */}
      <Card id="journal" className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <h2 className="font-bold text-foreground">Journal SMS (mock)</h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{JOURNAL.length} envois</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Date</th>
                <th className="px-4 py-2.5 text-left">Type</th>
                <th className="px-4 py-2.5 text-left">Destinataire</th>
                <th className="px-4 py-2.5 text-left">Message (extrait)</th>
                <th className="px-4 py-2.5 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {JOURNAL.map((l, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">{l.date}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={typeTone(l.type)}>{l.type}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-ew-green-700">{l.dest}</td>
                  <td className="max-w-[360px] truncate px-4 py-2.5 text-muted-foreground">{l.msg}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone="green">envoyé (mock)</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </PremiumGate>
    </ModulePage>
  );
}

/* ------------------------------ Ajouter un contact ------------------------------ */
function AddContactDialog({ onAdd }: { onAdd: (c: Contact) => void }) {
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState<Contact>({ eleve: "", classe: "", parent: "", tel: "+225 ", email: "" });
  const reset = () => setF({ eleve: "", classe: "", parent: "", tel: "+225 ", email: "" });
  const canSubmit = f.eleve.trim() && f.parent.trim() && f.tel.trim().length > 5;

  const submit = () => {
    onAdd({ ...f, email: f.email.trim() || "—" });
    toast.success("Contact ajouté", { description: `${f.parent} — parent de ${f.eleve}.` });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un contact parent</DialogTitle>
          <DialogDescription>Le contact recevra les alertes SMS selon les canaux activés.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Élève</Label>
            <Input value={f.eleve} onChange={(e) => setF((p) => ({ ...p, eleve: e.target.value }))} placeholder="Kouadio Aya" />
          </div>
          <div className="space-y-1.5">
            <Label>Classe</Label>
            <Input value={f.classe} onChange={(e) => setF((p) => ({ ...p, classe: e.target.value }))} placeholder="5ème 1" />
          </div>
          <div className="space-y-1.5">
            <Label>Parent</Label>
            <Input value={f.parent} onChange={(e) => setF((p) => ({ ...p, parent: e.target.value }))} placeholder="KOUADIO Daniel" />
          </div>
          <div className="space-y-1.5">
            <Label>Téléphone</Label>
            <Input value={f.tel} onChange={(e) => setF((p) => ({ ...p, tel: e.target.value }))} placeholder="+225 07 08 09 10 11" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={f.email} onChange={(e) => setF((p) => ({ ...p, email: e.target.value }))} placeholder="parent@email.ci" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            Ajouter le contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
