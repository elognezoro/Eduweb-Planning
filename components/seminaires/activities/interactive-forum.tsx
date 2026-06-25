"use client";

import * as React from "react";
import {
  CornerDownRight,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import type { ForumPost } from "@/components/app-shell/data-store";
import {
  useProductionSync,
  removeProductionRemote,
} from "@/components/seminaires/use-production-sync";
import {
  synthesizeForum,
  type ForumMessage,
} from "@/lib/seminaires/forum-synthesis";
import { cn } from "@/lib/utils";

/**
 * Forum collaboratif d'activité de formation.
 *
 * - Affiche les messages publiés dans le contexte (cours, module, activité).
 * - L'utilisateur peut publier un message principal ou répondre à un autre.
 * - L'auteur d'un message et l'administrateur peuvent le supprimer.
 * - Bouton « Synthèse IA » : produit deux synthèses heuristiques —
 *   mes interventions et tous les échanges. La synthèse est entièrement
 *   calculée côté client à partir des messages persistés.
 */
export function InteractiveForum({
  instructions,
  courseId,
  moduleId,
  activityId,
}: {
  instructions?: string;
  courseId: string;
  moduleId: string;
  activityId: string;
}) {
  const app = useApp();
  const store = useStore();
  const isAdmin = app.effectiveRole === "admin";

  const posts = React.useMemo(
    () =>
      store.forumPosts
        .filter((p) => p.activityId === activityId)
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
    [store.forumPosts, activityId],
  );

  const myPosts = posts.filter((p) => p.userId === app.user.id);
  const roots = posts.filter((p) => p.parentId === null);

  // Persistance Supabase : mes messages remontent ; le fil affiché agrège tous
  // les participants (RLS) après le pull du cours.
  useProductionSync(courseId, "forum", myPosts);

  const [draft, setDraft] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [showSynthesis, setShowSynthesis] = React.useState(false);

  function send() {
    const value = draft.trim();
    if (!value) return;
    store.postForumMessage({
      userId: app.user.id,
      userName: app.user.displayName,
      userRole: app.effectiveRole,
      courseId,
      moduleId,
      activityId,
      parentId: replyTo,
      content: value,
    });
    setDraft("");
    setReplyTo(null);
  }

  function deletePost(p: ForumPost) {
    if (!isAdmin && p.userId !== app.user.id) return;
    const ok = window.confirm("Supprimer ce message (et ses réponses) ?");
    if (!ok) return;
    store.removeForumPost(p.id);
    removeProductionRemote(p.id);
    posts
      .filter((r) => r.parentId === p.id)
      .forEach((r) => removeProductionRemote(r.id));
  }

  const personalSynthesis = React.useMemo(
    () => synthesizeForum(myPosts.map(toForumMessage)),
    [myPosts],
  );
  const globalSynthesis = React.useMemo(
    () => synthesizeForum(posts.map(toForumMessage)),
    [posts],
  );

  return (
    <div className="space-y-4">
      {instructions ? (
        <div className="rounded-md border border-ew-green-200 bg-ew-green-50/40 px-3 py-2 text-sm text-foreground/90">
          {instructions}
        </div>
      ) : null}

      {/* Composer */}
      <div className="rounded-2xl border border-border bg-card p-3">
        {replyTo ? (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1 text-xs">
            <CornerDownRight aria-hidden className="h-3.5 w-3.5 text-ew-green-700" />
            <span>
              Réponse à <strong>{posts.find((p) => p.id === replyTo)?.userName}</strong>
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="ml-auto text-xs text-muted-foreground hover:underline"
            >
              Annuler
            </button>
          </div>
        ) : null}
        <div className="flex items-start gap-2">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-sm font-bold text-white"
          >
            {initials(app.user.displayName)}
          </span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              replyTo
                ? "Votre réponse…"
                : "Partagez votre opinion ou un exemple concret de votre domaine…"
            }
            rows={3}
            className="flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Publié sous votre nom <strong className="text-foreground">{app.user.displayName}</strong>.
          </p>
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-ew-green-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 hover:bg-ew-green-800"
          >
            <Send aria-hidden className="h-3.5 w-3.5" />
            {replyTo ? "Publier la réponse" : "Publier"}
          </button>
        </div>
      </div>

      {/* Liste des messages */}
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <MessageCircle aria-hidden className="h-4 w-4" /> Fil de discussion
          <span className="rounded-full bg-ew-green-100 px-2 py-0.5 text-[10px] font-bold text-ew-green-800">
            {posts.length} message{posts.length > 1 ? "s" : ""}
          </span>
        </p>
        {roots.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-background/60 px-3 py-4 text-center text-sm italic text-muted-foreground">
            Soyez le premier à publier dans le forum.
          </p>
        ) : (
          <ul className="space-y-3">
            {roots.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                replies={posts.filter((c) => c.parentId === p.id)}
                myId={app.user.id}
                isAdmin={isAdmin}
                onReply={() => setReplyTo(p.id)}
                onDelete={() => deletePost(p)}
                onDeleteReply={(rp) => deletePost(rp)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Synthèse IA */}
      <div className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-ew-purple-700">
            <Sparkles aria-hidden className="h-4 w-4" /> Synthèse IA des échanges
          </p>
          <button
            type="button"
            onClick={() => setShowSynthesis((v) => !v)}
            className="rounded-md border border-ew-purple-200 bg-card px-2.5 py-1 text-xs font-bold text-ew-purple-700 hover:bg-ew-purple-100"
            aria-expanded={showSynthesis}
          >
            {showSynthesis ? "Masquer" : "Générer la synthèse"}
          </button>
        </div>
        <p className="mt-1 text-[11px] italic text-muted-foreground">
          Synthèse produite automatiquement à partir des messages publiés ;
          présentée comme aide pédagogique, à valider par le formateur.
        </p>

        {showSynthesis ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <SynthesisCard
              title="Synthèse de mes interventions"
              empty="Vous n'avez encore publié aucun message dans ce forum."
              synthesis={personalSynthesis}
            />
            <SynthesisCard
              title="Synthèse des échanges du groupe"
              empty="Le forum est vide pour le moment."
              synthesis={globalSynthesis}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------- Carte d'un message + ses réponses -------- */
function PostCard({
  post,
  replies,
  myId,
  isAdmin,
  onReply,
  onDelete,
  onDeleteReply,
}: {
  post: ForumPost;
  replies: ForumPost[];
  myId: string;
  isAdmin: boolean;
  onReply: () => void;
  onDelete: () => void;
  onDeleteReply: (r: ForumPost) => void;
}) {
  const mine = post.userId === myId;
  return (
    <li className="rounded-2xl border border-border bg-card p-3">
      <PostBody
        post={post}
        mine={mine}
        canDelete={mine || isAdmin}
        onDelete={onDelete}
        onReply={onReply}
      />
      {replies.length > 0 ? (
        <ul className="mt-3 space-y-2 border-l-2 border-ew-green-200 pl-3">
          {replies
            .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
            .map((r) => (
              <li key={r.id} className="rounded-md border border-border bg-background/60 p-2.5">
                <PostBody
                  post={r}
                  mine={r.userId === myId}
                  canDelete={r.userId === myId || isAdmin}
                  onDelete={() => onDeleteReply(r)}
                  // Pas de bouton « répondre » sur une réponse (1 niveau).
                />
              </li>
            ))}
        </ul>
      ) : null}
    </li>
  );
}

function PostBody({
  post,
  mine,
  canDelete,
  onDelete,
  onReply,
}: {
  post: ForumPost;
  mine: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onReply?: () => void;
}) {
  const date = new Date(post.createdAt).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <article>
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            mine ? "bg-ew-green-700 text-white" : "bg-muted text-foreground",
          )}
        >
          {initials(post.userName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
            <span>{post.userName}</span>
            {mine ? (
              <span className="rounded bg-ew-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ew-green-800">
                Vous
              </span>
            ) : null}
            {post.userRole ? (
              <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <UserIcon aria-hidden className="mr-0.5 inline h-2.5 w-2.5" />
                {post.userRole}
              </span>
            ) : null}
            <span className="ml-auto text-[11px] font-normal text-muted-foreground">{date}</span>
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">{post.content}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {onReply ? (
              <button
                type="button"
                onClick={onReply}
                className="inline-flex items-center gap-1 text-xs font-bold text-ew-green-700 hover:underline"
              >
                <CornerDownRight aria-hidden className="h-3.5 w-3.5" /> Répondre
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline"
              >
                <Trash2 aria-hidden className="h-3.5 w-3.5" /> Supprimer
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------- Carte d'une synthèse -------- */
function SynthesisCard({
  title,
  empty,
  synthesis,
}: {
  title: string;
  empty: string;
  synthesis: ReturnType<typeof synthesizeForum>;
}) {
  return (
    <div className="rounded-xl border border-ew-purple-200 bg-card p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">{title}</p>
      {synthesis.totalMessages === 0 ? (
        <p className="mt-2 text-sm italic text-muted-foreground">{empty}</p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{synthesis.paragraph}</p>
          {synthesis.topKeywords.length > 0 ? (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Mots-clés dominants
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {synthesis.topKeywords.map((k) => (
                  <span
                    key={k.word}
                    className="rounded-full border border-ew-purple-200 bg-ew-purple-50 px-2 py-0.5 text-[11px] font-medium text-ew-purple-700"
                  >
                    {k.word} · {k.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {synthesis.highlights.length > 0 ? (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Extraits saillants
              </p>
              <ul className="mt-1 space-y-1">
                {synthesis.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="rounded-md border-l-2 border-ew-purple-300 bg-ew-purple-50/60 px-2 py-1 text-xs"
                  >
                    <strong className="text-ew-purple-700">{h.userName}</strong> — {h.excerpt}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function toForumMessage(p: ForumPost): ForumMessage {
  return {
    id: p.id,
    userId: p.userId,
    userName: p.userName,
    content: p.content,
    parentId: p.parentId,
    createdAt: p.createdAt,
  };
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(1, "•");
}
