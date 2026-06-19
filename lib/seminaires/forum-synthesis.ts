/**
 * Synthèse heuristique des échanges d'un forum collaboratif d'activité.
 *
 * Fonctionne 100% côté client, sans dépendance à un LLM externe. La
 * synthèse repose sur une analyse statistique simple : extraction de
 * mots-clés (en excluant les mots vides), comptage des occurrences,
 * détection des contributeurs les plus actifs, et identification des
 * extraits saillants (les plus longs / les plus cités).
 *
 * Cette synthèse est présentée à l'utilisateur sous l'étiquette
 * « Synthèse IA » avec une mention indiquant qu'elle est produite
 * automatiquement à des fins pédagogiques.
 */

/** Mots vides du français à exclure du décompte des mots-clés. */
const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "d", "l",
  "et", "ou", "ni", "mais", "donc", "or", "car", "si",
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
  "me", "te", "se", "lui", "leur", "leurs", "mon", "ma", "mes",
  "ton", "ta", "tes", "son", "sa", "ses", "notre", "votre", "nos", "vos",
  "ce", "cet", "cette", "ces", "ça", "cela", "ceci",
  "qui", "que", "quoi", "dont", "où", "lequel", "laquelle",
  "est", "sont", "était", "étaient", "sera", "seront", "a", "ai", "as",
  "ont", "avait", "avaient", "aura", "auront", "été", "être", "avoir",
  "y", "en", "ne", "pas", "plus", "moins", "très", "peu", "trop",
  "dans", "sur", "sous", "vers", "par", "pour", "avec", "sans",
  "entre", "chez", "depuis", "pendant", "après", "avant", "contre",
  "aussi", "bien", "mal", "encore", "déjà", "jamais", "toujours",
  "ici", "là", "alors", "ainsi", "donc", "puis", "ensuite", "enfin",
  "tout", "tous", "toute", "toutes", "même", "mêmes", "autre", "autres",
  "fait", "faire", "fais", "font", "comme",
]);

/** Un message du forum, simplifié pour la synthèse. */
export interface ForumMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  parentId: string | null;
  createdAt: string;
}

/** Résultat structuré d'une synthèse. */
export interface ForumSynthesis {
  /** Nombre total de messages. */
  totalMessages: number;
  /** Nombre de participants distincts. */
  participants: number;
  /** Mots-clés dominants avec leur fréquence. */
  topKeywords: { word: string; count: number }[];
  /** Sentiment global (très approximatif). */
  tone: "positif" | "nuancé" | "préoccupé" | "neutre";
  /** Contributeurs les plus actifs (nom + nombre de messages). */
  topContributors: { userName: string; count: number }[];
  /** Extraits saillants (les plus longs et représentatifs). */
  highlights: { userName: string; excerpt: string }[];
  /** Résumé en 2-3 phrases. */
  paragraph: string;
}

/** Normalise un mot (minuscules, sans accents, sans ponctuation). */
function normalize(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .trim();
}

/** Compte les mots-clés (hors mots vides, longueur ≥ 4). */
function countKeywords(messages: ForumMessage[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const m of messages) {
    const words = m.content.split(/\s+/);
    for (const raw of words) {
      const w = normalize(raw);
      if (!w || w.length < 4) continue;
      if (STOP_WORDS.has(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  return counts;
}

/** Détecte un sentiment global très approximatif. */
function detectTone(messages: ForumMessage[]): ForumSynthesis["tone"] {
  if (messages.length === 0) return "neutre";
  const positives = [
    "bénéfique", "utile", "opportunité", "espérance", "progrès", "réussite",
    "innovation", "transforme", "améliore", "facilite", "soutient",
  ];
  const negatives = [
    "risque", "danger", "préoccupation", "inquiétude", "peur", "perte",
    "manipulation", "déshumanisation", "menace", "abus", "dérive",
    "ambigu", "fragilise",
  ];
  let pos = 0;
  let neg = 0;
  for (const m of messages) {
    const lower = m.content.toLowerCase();
    for (const w of positives) if (lower.includes(w)) pos++;
    for (const w of negatives) if (lower.includes(w)) neg++;
  }
  if (pos === 0 && neg === 0) return "neutre";
  if (pos > neg * 1.5) return "positif";
  if (neg > pos * 1.5) return "préoccupé";
  return "nuancé";
}

/** Sélectionne les extraits les plus représentatifs (longs et variés). */
function pickHighlights(messages: ForumMessage[]): ForumSynthesis["highlights"] {
  const seenAuthors = new Set<string>();
  const sorted = [...messages].sort((a, b) => b.content.length - a.content.length);
  const out: ForumSynthesis["highlights"] = [];
  for (const m of sorted) {
    if (out.length >= 3) break;
    if (seenAuthors.has(m.userId)) continue;
    seenAuthors.add(m.userId);
    const trimmed = m.content.trim().replace(/\s+/g, " ");
    const excerpt =
      trimmed.length > 220 ? trimmed.slice(0, 217).trimEnd() + "…" : trimmed;
    out.push({ userName: m.userName, excerpt });
  }
  return out;
}

/** Génère la synthèse d'un ensemble de messages. */
export function synthesizeForum(messages: ForumMessage[]): ForumSynthesis {
  const totalMessages = messages.length;
  const participants = new Set(messages.map((m) => m.userId)).size;
  const keywordMap = countKeywords(messages);
  const topKeywords = Array.from(keywordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const tone = detectTone(messages);

  const contributorMap = new Map<string, { userName: string; count: number }>();
  for (const m of messages) {
    const existing = contributorMap.get(m.userId);
    if (existing) existing.count++;
    else contributorMap.set(m.userId, { userName: m.userName, count: 1 });
  }
  const topContributors = Array.from(contributorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const highlights = pickHighlights(messages);

  let paragraph: string;
  if (totalMessages === 0) {
    paragraph = "Aucun message n'a encore été publié dans ce forum.";
  } else {
    const kw = topKeywords.slice(0, 4).map((k) => `« ${k.word} »`).join(", ");
    const toneText: Record<ForumSynthesis["tone"], string> = {
      positif: "globalement positive, valorisant les opportunités",
      "nuancé": "nuancée, équilibrant promesses et vigilance",
      "préoccupé": "marquée par des préoccupations et points de vigilance",
      neutre: "neutre, restant descriptive",
    };
    paragraph =
      `${totalMessages} message${totalMessages > 1 ? "s" : ""} publié${totalMessages > 1 ? "s" : ""} par ${participants} participant${participants > 1 ? "s" : ""}. ` +
      (kw ? `Les notions les plus revenues sont ${kw}. ` : "") +
      `La tonalité d'ensemble est ${toneText[tone]}.`;
  }

  return {
    totalMessages,
    participants,
    topKeywords,
    tone,
    topContributors,
    highlights,
    paragraph,
  };
}
