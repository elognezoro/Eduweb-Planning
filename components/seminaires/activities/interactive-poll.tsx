"use client";

import * as React from "react";
import { BarChart3, CheckCircle2, RefreshCw, Users } from "lucide-react";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";

/**
 * Sondage interactif d'activité de formation.
 *
 * - Affiche les options sous forme de boutons.
 * - L'utilisateur vote ; sa réponse est enregistrée nominativement
 *   (un seul vote par utilisateur, modifiable).
 * - Une fois voté, affiche les résultats agrégés (votes, %, barre).
 * - L'utilisateur peut changer sa réponse à tout moment.
 *
 * Persistance via `useStore().pollResponses` (localStorage).
 */
export function InteractivePoll({
  question,
  options,
  courseId,
  moduleId,
  activityId,
}: {
  question: string;
  options: string[];
  courseId: string;
  moduleId: string;
  activityId: string;
}) {
  const app = useApp();
  const store = useStore();

  const myResponse = store.pollResponses.find(
    (r) => r.userId === app.user.id && r.activityId === activityId,
  );
  const responsesForActivity = store.pollResponses.filter(
    (r) => r.activityId === activityId,
  );
  const totalVotes = responsesForActivity.length;
  const tally = React.useMemo(() => {
    const counts: Record<string, number> = {};
    options.forEach((o) => (counts[o] = 0));
    for (const r of responsesForActivity) {
      counts[r.value] = (counts[r.value] ?? 0) + 1;
    }
    return counts;
  }, [responsesForActivity, options]);

  function vote(value: string) {
    store.submitPollResponse({
      userId: app.user.id,
      userName: app.user.displayName,
      courseId,
      moduleId,
      activityId,
      value,
    });
  }

  function changeVote() {
    if (myResponse) {
      store.removePollResponse(app.user.id, activityId);
    }
  }

  if (!myResponse) {
    // Phase 1 : voter.
    return (
      <div className="space-y-3">
        <p className="text-base font-bold text-foreground">{question}</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => vote(o)}
              className="rounded-full border border-ew-green-200 bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-ew-green-600 hover:bg-ew-green-50 hover:text-ew-green-900"
            >
              {o}
            </button>
          ))}
        </div>
        <p className="text-xs italic text-muted-foreground">
          Votre réponse est enregistrée nominativement. Vous pourrez la modifier
          ensuite.
        </p>
      </div>
    );
  }

  // Phase 2 : résultats agrégés + ma réponse.
  return (
    <div className="space-y-3">
      <p className="text-base font-bold text-foreground">{question}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-ew-green-300 bg-ew-green-50 px-3 py-2 text-sm">
        <p className="flex items-center gap-2">
          <CheckCircle2 aria-hidden className="h-4 w-4 text-ew-green-700" />
          Votre réponse : <strong className="text-ew-green-800">{myResponse.value}</strong>
        </p>
        <button
          type="button"
          onClick={changeVote}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground hover:bg-muted/40"
        >
          <RefreshCw aria-hidden className="h-3.5 w-3.5" /> Changer ma réponse
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
            <BarChart3 aria-hidden className="h-4 w-4" /> Résultats du groupe
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users aria-hidden className="h-3.5 w-3.5" />
            {totalVotes} vote{totalVotes > 1 ? "s" : ""}
          </p>
        </div>
        <ul className="mt-3 space-y-2">
          {options
            .map((o) => ({ value: o, count: tally[o] ?? 0 }))
            .sort((a, b) => b.count - a.count)
            .map(({ value, count }) => {
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isMine = value === myResponse.value;
              return (
                <li key={value} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex items-center gap-1 ${
                        isMine ? "font-bold text-ew-green-800" : ""
                      }`}
                    >
                      {value}
                      {isMine ? (
                        <span className="rounded bg-ew-green-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Vous
                        </span>
                      ) : null}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground/80">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/40"
                    aria-hidden
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        isMine ? "bg-ew-green-700" : "bg-ew-green-300"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
