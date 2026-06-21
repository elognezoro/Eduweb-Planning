"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  MessagesSquare,
  Send,
  Megaphone,
  Mail,
  Search,
  Eye,
  Trash2,
  Building2,
  Users,
  Globe,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/components/app-shell/data-store";
import { useApp } from "@/components/app-shell/app-context";
import { getRole } from "@/lib/roles";
import { MESSAGES } from "@/lib/mock-data";
import { CountrySearchSelect } from "@/components/forms/country-select";
import {
  EtablissementCombobox,
  type EtablissementSelection,
} from "@/components/etablissements/etablissement-combobox";
import type { Announcement } from "@/lib/types";
import { initials, formatDate, cn } from "@/lib/utils";

type Message = (typeof MESSAGES)[number];
type ScopeFilter = "all" | "pays" | "etablissement" | "classe";

const SCOPE_LABEL: Record<string, string> = { pays: "Pays", etablissement: "Établissement", classe: "Classe" };
const SCOPE_TONE: Record<string, "blue" | "teal" | "purple"> = { pays: "blue", etablissement: "teal", classe: "purple" };
const CLASSES = ["6ᵉ A", "5ᵉ B", "4ᵉ C", "3ᵉ A", "2ⁿᵈᵉ C", "1ʳᵉ D", "Tˡᵉ A", "Tˡᵉ D"];

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function CommunicationPage() {
  const t = useTranslations();
  const { announcements, addAnnouncement, removeAnnouncement } = useStore();
  const [messages] = React.useState<Message[]>(MESSAGES);

  return (
    <ModulePage title={t("pages.vieScolaireCommunication.title")} description={t("pages.vieScolaireCommunication.description")}
      icon={MessagesSquare}
      permission="communication:view"
      sections={[
        { id: "boite", label: "Boîte de réception" },
        { id: "nouvelle", label: "Nouvelle annonce" },
        { id: "annonces", label: "Annonces" },
      ]}
      kpis={[
        { label: "Messages non lus", value: messages.filter((m) => !m.read).length, icon: Mail, tone: "blue" },
        { label: "Annonces actives", value: announcements.length, icon: Megaphone, tone: "gold" },
        { label: "Taux de lecture", value: "87 %", icon: Send, tone: "green" },
        { label: "Groupes cibles", value: 6, icon: MessagesSquare, tone: "purple" },
      ]}
    >
      <TwoColumn className="lg:grid-cols-[2fr_3fr]">
        <SectionCard id="boite" title="Boîte de réception">
          <ul className="divide-y divide-border">
            {messages.map((m) => (
              <li key={m.id} className="flex items-start gap-3 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-ew-green-100 text-xs text-ew-green-800">{initials(m.from)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm text-foreground", m.read ? "font-medium" : "font-bold")}>{m.from}</p>
                    {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-ew-green-600" />}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">{m.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <AnnouncementComposer onPublish={addAnnouncement} />
      </TwoColumn>

      <AnnouncementsSection announcements={announcements} onRemove={removeAnnouncement} />
    </ModulePage>
  );
}

/* ----------------------------- Composer (Nouvelle annonce) ----------------------------- */
function AnnouncementComposer({ onPublish }: { onPublish: (a: Omit<Announcement, "id">) => void }) {
  const { user, effectiveRole } = useApp();
  const [pays, setPays] = React.useState("tous");
  // null = « Tous les établissements » ; sinon un établissement du référentiel CI.
  const [etabSel, setEtabSel] = React.useState<EtablissementSelection | null>(null);
  const etabName = etabSel?.name ?? null;
  const [audience, setAudience] = React.useState<"etablissement" | "classe">("etablissement");
  const [classes, setClasses] = React.useState<string[]>([]);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [important, setImportant] = React.useState(false);
  const [expiresAt, setExpiresAt] = React.useState("");

  const reset = () => {
    setTitle("");
    setBody("");
    setImportant(false);
    setExpiresAt("");
    setClasses([]);
  };

  const diffusionNote =
    pays === "tous"
      ? "Diffusée à tous les établissements du réseau."
      : etabName == null
        ? `Diffusée aux établissements de ${pays}.`
        : `Diffusée à ${etabName}.`;

  const toggleClass = (c: string) => setClasses((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const publish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Le titre et le contenu sont requis");
      return;
    }
    const scope: Announcement["scope"] = audience === "classe" ? "classe" : pays === "tous" ? "pays" : "etablissement";
    onPublish({
      title: title.trim(),
      body: body.trim(),
      priority: important ? "high" : "normal",
      date: new Date().toISOString(),
      scope,
      important,
      author: user.displayName,
      authorRole: getRole(effectiveRole).label,
      views: 0,
      expiresAt: expiresAt || undefined,
      audience: audience === "classe" ? `Classes : ${classes.join(", ") || "—"}` : "Tout l'établissement",
    });
    toast.success("Annonce publiée", { description: diffusionNote });
    reset();
  };

  return (
    <SectionCard id="nouvelle" title="Nouvelle annonce" description="Adressez une annonce à un groupe, un établissement ou tout le réseau.">
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Portée géographique
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Pays</Label>
              <CountrySearchSelect value={pays} onChange={setPays} allowAll allValue="tous" valueAs="name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Établissement</Label>
              <EtablissementCombobox
                value={etabSel}
                onChange={setEtabSel}
                disabled={pays === "tous"}
                placeholder="Tous les établissements (laisser vide) ou rechercher…"
              />
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-ew-gold-600">{diffusionNote}</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Destinataires</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAudience("etablissement")}
              className={cn("flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors", audience === "etablissement" ? "border-ew-green-600 bg-ew-green-50 text-ew-green-800" : "border-border bg-card text-foreground hover:bg-muted")}
            >
              <Building2 className="h-4 w-4" /> Tout l&apos;établissement
            </button>
            <button
              type="button"
              onClick={() => setAudience("classe")}
              className={cn("flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors", audience === "classe" ? "border-ew-green-600 bg-ew-green-50 text-ew-green-800" : "border-border bg-card text-foreground hover:bg-muted")}
            >
              <Users className="h-4 w-4" /> Classes spécifiques
            </button>
          </div>
          {audience === "classe" && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CLASSES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleClass(c)}
                  className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors", classes.includes(c) ? "border-ew-green-600 bg-ew-green-600 text-white" : "border-border text-foreground hover:bg-muted")}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Titre</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Réunion parents-professeurs…" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Contenu de l&apos;annonce</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Détaillez votre annonce ici…" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" className="h-4 w-4 accent-ew-green-700" checked={important} onChange={(e) => setImportant(e.target.checked)} />
            Marquer comme important
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Expire le :</span>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-9 w-40" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={reset}>Annuler</Button>
          <Button onClick={publish}>
            <Send className="h-4 w-4" /> Publier
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

/* --------------------------- Annonces (recherche + filtres) --------------------------- */
function AnnouncementsSection({ announcements, onRemove }: { announcements: Announcement[]; onRemove: (id: string) => void }) {
  const [q, setQ] = React.useState("");
  const [scope, setScope] = React.useState<ScopeFilter>("all");
  const [detail, setDetail] = React.useState<Announcement | null>(null);

  const filters: { key: ScopeFilter; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "pays", label: "Pays" },
    { key: "etablissement", label: "Établissement" },
    { key: "classe", label: "Classe" },
  ];

  const visible = announcements.filter(
    (a) => (scope === "all" || a.scope === scope) && `${a.title} ${a.body}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <SectionCard id="annonces" title="Annonces" description="Annonces et informations pour l'établissement.">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une annonce…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setScope(f.key)}
              className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors", scope === f.key ? "bg-ew-green-800 text-white" : "text-foreground hover:bg-muted")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Aucune annonce ne correspond à votre recherche.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <button
              key={a.id}
              onClick={() => setDetail(a)}
              className={cn("block w-full rounded-xl border p-4 text-left transition-colors hover:border-ew-green-600 hover:bg-muted/30", a.important ? "border-ew-gold-100 bg-ew-gold-100/40" : "border-border")}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {a.important && <Badge tone="gold">Important</Badge>}
                  {a.scope && <Badge tone={SCOPE_TONE[a.scope]}>{SCOPE_LABEL[a.scope]}</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-md p-1.5 text-muted-foreground" title="Aperçu"><Eye className="h-4 w-4" /></span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Supprimer"
                    onClick={(e) => { e.stopPropagation(); onRemove(a.id); toast("Annonce supprimée"); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onRemove(a.id); } }}
                    className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <h3 className="mt-2 font-bold text-foreground">{a.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(a.date)}</span>
                {a.author && <span>Par {a.author}</span>}
                {typeof a.views === "number" && <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a.views} vues</span>}
              </p>
            </button>
          ))}
        </div>
      )}

      {detail && <AnnouncementDetail announcement={detail} onClose={() => setDetail(null)} />}
    </SectionCard>
  );
}

function AnnouncementDetail({ announcement: a, onClose }: { announcement: Announcement; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            {a.important && <Badge tone="gold">Important</Badge>}
            {a.scope && <Badge tone={SCOPE_TONE[a.scope]}>{SCOPE_LABEL[a.scope]}</Badge>}
          </div>
          <DialogTitle className="text-xl">{a.title}</DialogTitle>
        </DialogHeader>

        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{a.body}</p>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Publié par</p>
            <p className="mt-0.5 font-semibold text-foreground">{a.author ?? "—"}</p>
            {a.authorRole && <p className="text-xs text-muted-foreground">{a.authorRole}</p>}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Date</p>
            <p className="mt-0.5 font-semibold text-foreground">{formatDate(a.date)}{fmtTime(a.date) ? ` · ${fmtTime(a.date)}` : ""}</p>
            {typeof a.views === "number" && <p className="text-xs text-muted-foreground">{a.views} vues</p>}
          </div>
          {a.audience && (
            <div className="col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Destinataires</p>
              <p className="mt-0.5 text-foreground">{a.audience}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
