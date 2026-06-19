"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  Info,
  Lightbulb,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import type { MindMapContribution } from "@/components/app-shell/data-store";
import { cn } from "@/lib/utils";

/**
 * Carte mentale collaborative à deux pôles, déclinée en trois catégories.
 *
 * Conçue pour l'activité « 1.1 Carte mentale collaborative » de Magnifica
 * Humanitas : les apprenants opposent la « Babel numérique » à la
 * « Jérusalem numérique » en versant des mots-clés, exemples et risques
 * ou opportunités dans chaque pôle. Les contributions sont nominatives,
 * persistées, et chacun peut retirer les siennes (l'admin peut tout
 * supprimer).
 *
 * Les exemples fournis dans la définition de l'activité (Babel numérique :
 * domination, surveillance, … ; Jérusalem numérique : coopération, service,
 * …) sont affichés en infobulle comme suggestion de démarrage.
 */
export interface MindMapPole {
  id: string;
  label: string;
  description?: string;
  /** Suggestions initiales affichées en infobulle. */
  hint?: string;
  /** Tonalité visuelle. */
  tone: "warning" | "success";
}

export interface MindMapCategory {
  id: string;
  label: string;
  /** Nombre minimum de contributions attendu (affiché en compteur). */
  minimum?: number;
  icon: "tag" | "lightbulb" | "heart" | "alert";
}

const DEFAULT_POLES: MindMapPole[] = [
  {
    id: "babel",
    label: "Babel numérique",
    description: "Pouvoir technique autosuffisant, dominateur, uniforme.",
    hint:
      "Exemples du support : domination, surveillance, manipulation, uniformisation, exclusion, profit sans limite.",
    tone: "warning",
  },
  {
    id: "jerusalem",
    label: "Jérusalem numérique",
    description: "Reconstruction patiente, communauté, écoute, bien commun.",
    hint:
      "Exemples du support : coopération, service, inclusion, vérité, responsabilité, protection des plus fragiles.",
    tone: "success",
  },
];

const DEFAULT_CATEGORIES: MindMapCategory[] = [
  { id: "keywords", label: "Mots-clés", minimum: 3, icon: "tag" },
  { id: "examples", label: "Exemples", minimum: 3, icon: "lightbulb" },
  { id: "risks", label: "Risques / opportunités", minimum: 3, icon: "heart" },
];

export function InteractiveMindMap({
  courseId,
  moduleId,
  activityId,
  poles = DEFAULT_POLES,
  categories = DEFAULT_CATEGORIES,
  instructions,
}: {
  courseId: string;
  moduleId: string;
  activityId: string;
  poles?: MindMapPole[];
  categories?: MindMapCategory[];
  instructions?: string;
}) {
  const app = useApp();
  const store = useStore();
  const isAdmin = app.effectiveRole === "admin";

  const all = React.useMemo(
    () => store.mindMapContributions.filter((c) => c.activityId === activityId),
    [store.mindMapContributions, activityId],
  );

  function add(poleId: string, categoryId: string, content: string) {
    const value = content.trim();
    if (!value) return;
    store.postMindMapContribution({
      userId: app.user.id,
      userName: app.user.displayName,
      courseId,
      moduleId,
      activityId,
      pole: poleId,
      category: categoryId,
      content: value,
    });
  }

  function remove(c: MindMapContribution) {
    if (!isAdmin && c.userId !== app.user.id) return;
    store.removeMindMapContribution(c.id);
  }

  // Statistiques globales pour l'en-tête.
  const totalContribs = all.length;
  const distinctContributors = new Set(all.map((c) => c.userId)).size;

  return (
    <div className="space-y-3">
      {instructions ? (
        <p className="rounded-md border border-ew-green-200 bg-ew-green-50/40 px-3 py-2 text-sm text-foreground/90">
          {instructions}
        </p>
      ) : null}

      <HowItWorks />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-ew-green-700">
          <Sparkles aria-hidden className="h-3.5 w-3.5" /> Carte mentale collaborative
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5">
            <Tag aria-hidden className="h-3 w-3" />
            {totalContribs} contribution{totalContribs > 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5">
            <Users aria-hidden className="h-3 w-3" />
            {distinctContributors} participant{distinctContributors > 1 ? "s" : ""}
          </span>
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {poles.map((pole) => (
          <PoleColumn
            key={pole.id}
            pole={pole}
            categories={categories}
            contributions={all.filter((c) => c.pole === pole.id)}
            currentUserId={app.user.id}
            isAdmin={isAdmin}
            onAdd={(catId, value) => add(pole.id, catId, value)}
            onRemove={remove}
          />
        ))}
      </div>
    </div>
  );
}

/* ----- Colonne d'un pôle (Babel ou Jérusalem) ----- */
function PoleColumn({
  pole,
  categories,
  contributions,
  currentUserId,
  isAdmin,
  onAdd,
  onRemove,
}: {
  pole: MindMapPole;
  categories: MindMapCategory[];
  contributions: MindMapContribution[];
  currentUserId: string;
  isAdmin: boolean;
  onAdd: (categoryId: string, content: string) => void;
  onRemove: (c: MindMapContribution) => void;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border-2 p-4 shadow-sm",
        pole.tone === "warning"
          ? "border-ew-gold-200 bg-ew-gold-50/40"
          : "border-ew-green-300 bg-ew-green-50/40",
      )}
      aria-labelledby={`pole-${pole.id}-title`}
    >
      <header className="mb-3 flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white",
            pole.tone === "warning" ? "bg-ew-gold-600" : "bg-ew-green-700",
          )}
        >
          {pole.tone === "warning" ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            id={`pole-${pole.id}-title`}
            className={cn(
              "font-display text-lg font-extrabold",
              pole.tone === "warning" ? "text-ew-gold-700" : "text-ew-green-800",
            )}
          >
            {pole.label}
          </p>
          {pole.description ? (
            <p className="text-xs italic text-muted-foreground">{pole.description}</p>
          ) : null}
          {pole.hint ? (
            <p
              className={cn(
                "mt-1 rounded-md border-l-2 px-2 py-1 text-[11px] italic",
                pole.tone === "warning"
                  ? "border-ew-gold-500 bg-card text-ew-gold-700"
                  : "border-ew-green-500 bg-card text-ew-green-800",
              )}
            >
              💡 {pole.hint}
            </p>
          ) : null}
        </div>
      </header>

      <div className="space-y-3">
        {categories.map((cat) => {
          const items = contributions.filter((c) => c.category === cat.id);
          return (
            <CategoryZone
              key={cat.id}
              category={cat}
              items={items}
              tone={pole.tone}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onAdd={(value) => onAdd(cat.id, value)}
              onRemove={onRemove}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ----- Zone d'une catégorie (mots-clés, exemples, risques) ----- */
function CategoryZone({
  category,
  items,
  tone,
  currentUserId,
  isAdmin,
  onAdd,
  onRemove,
}: {
  category: MindMapCategory;
  items: MindMapContribution[];
  tone: "warning" | "success";
  currentUserId: string;
  isAdmin: boolean;
  onAdd: (value: string) => void;
  onRemove: (c: MindMapContribution) => void;
}) {
  const [draft, setDraft] = React.useState("");
  const [open, setOpen] = React.useState(false);

  function submit() {
    const v = draft.trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
    setOpen(false);
  }

  const min = category.minimum ?? 0;
  const reachedMinimum = items.length >= min;
  const Icon =
    category.icon === "tag"
      ? Tag
      : category.icon === "lightbulb"
        ? Lightbulb
        : category.icon === "heart"
          ? Heart
          : AlertTriangle;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground/80">
          <Icon aria-hidden className="h-3.5 w-3.5" />
          {category.label}
          <span
            className={cn(
              "ml-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
              reachedMinimum
                ? "bg-ew-green-100 text-ew-green-800"
                : "bg-muted/40 text-muted-foreground",
            )}
          >
            {items.length}
            {min > 0 ? ` / ${min} min.` : ""}
          </span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition-colors",
            tone === "warning"
              ? "bg-ew-gold-600 text-white hover:bg-ew-gold-700"
              : "bg-ew-green-700 text-white hover:bg-ew-green-800",
          )}
        >
          <Plus aria-hidden className="h-3.5 w-3.5" />
          Ajouter
        </button>
      </div>

      {open ? (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              category.id === "keywords"
                ? "Un mot ou une expression courte…"
                : category.id === "examples"
                  ? "Un exemple concret…"
                  : "Un risque ou une opportunité…"
            }
            autoFocus
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className="rounded-md bg-ew-green-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Publier
          </button>
        </div>
      ) : null}

      {/* Cartes-contributions */}
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <li className="text-[11px] italic text-muted-foreground">
            Aucune contribution pour le moment.
          </li>
        ) : (
          items
            .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
            .map((c) => {
              const mine = c.userId === currentUserId;
              const canRemove = mine || isAdmin;
              return (
                <li key={c.id}>
                  <span
                    className={cn(
                      "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                      mine
                        ? tone === "warning"
                          ? "border-ew-gold-500 bg-ew-gold-50 text-ew-gold-700"
                          : "border-ew-green-600 bg-ew-green-100 text-ew-green-900"
                        : "border-border bg-background/80 text-foreground",
                    )}
                    title={`${c.userName} · ${new Date(c.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}`}
                  >
                    <span className="font-medium">{c.content}</span>
                    <span className="text-[10px] italic text-muted-foreground">
                      — {c.userName.split(" ")[0]}
                    </span>
                    {canRemove ? (
                      <button
                        type="button"
                        onClick={() => onRemove(c)}
                        aria-label={`Supprimer la contribution « ${c.content} »`}
                        className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    ) : null}
                  </span>
                </li>
              );
            })
        )}
      </ul>
    </div>
  );
}

/* ----- Principe de fonctionnement (pliable) ----- */
function HowItWorks() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="rounded-xl border border-ew-blue/30 bg-ew-blue/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ew-blue">
          <Info aria-hidden className="h-3.5 w-3.5" /> Comment ça marche ?
        </span>
        {open ? (
          <ChevronUp aria-hidden className="h-4 w-4 text-ew-blue" />
        ) : (
          <ChevronDown aria-hidden className="h-4 w-4 text-ew-blue" />
        )}
      </button>
      {open ? (
        <div className="space-y-1.5 border-t border-ew-blue/20 px-3 py-2 text-sm text-foreground/90">
          <p>
            La carte mentale oppose deux pôles complémentaires : la{" "}
            <strong className="text-ew-gold-700">Babel numérique</strong> (à
            gauche) et la <strong className="text-ew-green-800">Jérusalem
            numérique</strong> (à droite). Pour chaque pôle, vous contribuez
            à trois catégories : <strong>Mots-clés</strong>,{" "}
            <strong>Exemples</strong> et <strong>Risques / opportunités</strong>.
          </p>
          <ul className="ml-4 list-disc space-y-0.5 text-[13px]">
            <li>
              Cliquez sur <strong>« + Ajouter »</strong> dans la catégorie de
              votre choix, saisissez votre proposition, validez avec{" "}
              <kbd className="rounded border border-border bg-card px-1 py-0.5 text-[10px] font-mono">
                Entrée
              </kbd>{" "}
              ou avec le bouton <strong>Publier</strong>.
            </li>
            <li>
              Votre contribution apparaît sous votre nom, dans une pastille
              colorée — <span className="text-ew-gold-700">or</span> pour Babel,{" "}
              <span className="text-ew-green-800">vert</span> pour Jérusalem.
              Tous les participants voient les contributions des autres en
              temps réel.
            </li>
            <li>
              Le compteur <strong>N / 3 min.</strong> à côté de chaque catégorie
              passe au vert dès que l&apos;objectif minimum (3 contributions) est
              atteint.
            </li>
            <li>
              Vous pouvez retirer vos propres contributions à tout moment via
              l&apos;icône <Trash2 aria-hidden className="inline h-3 w-3" />.
              L&apos;administrateur ou le formateur peut modérer l&apos;ensemble
              du tableau.
            </li>
            <li>
              Inspirez-vous des <strong>suggestions de démarrage</strong>{" "}
              affichées dans l&apos;en-tête de chaque pôle, mais ajoutez vos
              propres mots, exemples et constats issus de votre contexte
              professionnel.
            </li>
          </ul>
          <p className="text-[12px] italic text-muted-foreground">
            Visez la diversité plutôt que le consensus : la richesse de la
            carte naît de la confrontation des regards.
          </p>
        </div>
      ) : null}
    </div>
  );
}
