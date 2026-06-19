"use client";

import * as React from "react";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================================
   NarrationButton — Lecture audio (TTS) d'un texte arbitraire.
   - Utilise l'API SpeechSynthesis native du navigateur (zéro dépendance,
     zéro API key, zéro coût).
   - Voix française préférée si disponible (`fr-FR`) ; bascule sur la voix
     par défaut sinon (avec lang="fr-FR" pour orienter le moteur).
   - Trois états : idle (▶︎), playing (⏸ + ⏹), paused (▶︎ + ⏹).
   - Le composant ne s'affiche pas si l'API n'est pas disponible.
   - Annule automatiquement la lecture lors du démontage ou du changement
     de texte (évite les fuites d'utterance entre pages).

   ─ Robustesse Chromium ──────────────────────────────────────────────────
   Le moteur SpeechSynthesis de Chromium coupe le son après ~15 secondes
   de débit continu (bug heartbeat). Pour contourner, on découpe le texte
   en phrases (~200 caractères max, frontière `.!?`) et on les enchaîne via
   `onend` — chaque utterance reste sous le seuil.
   ========================================================================== */

interface NarrationButtonProps {
  /** Texte à lire à voix haute. Chaînes vides → bouton désactivé. */
  text: string;
  /** Étiquette affichée à côté de l'icône. */
  label?: string;
  /** Mode compact : icône seule (pour insertion en ligne). */
  compact?: boolean;
  /** Classe optionnelle pour le wrapper. */
  className?: string;
}

/** Découpe un texte long en segments d'~200 caractères, sans casser
 * les phrases. Évite que Chromium coupe la lecture après 15 secondes. */
function chunkForTTS(text: string): string[] {
  const normalized = text.replace(/[‘’]/g, "'").trim();
  if (!normalized) return [];
  const MAX = 200;
  // Phrases séparées par .!? suivies d'un espace. Conserve le séparateur.
  const sentences = normalized.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    const candidate = current ? `${current} ${s}` : s;
    if (candidate.length <= MAX) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      if (s.length <= MAX) {
        current = s;
      } else {
        // Phrase isolée trop longue → on coupe par virgules ou par mots.
        const sub = s.split(/(?<=,)\s+/);
        let buf = "";
        for (const piece of sub) {
          const cand = buf ? `${buf} ${piece}` : piece;
          if (cand.length <= MAX) {
            buf = cand;
          } else {
            if (buf) chunks.push(buf);
            buf = piece;
          }
        }
        current = buf;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function NarrationButton({
  text,
  label = "Écouter",
  compact = false,
  className,
}: NarrationButtonProps) {
  const [status, setStatus] = React.useState<"idle" | "playing" | "paused">(
    "idle",
  );
  const [supported, setSupported] = React.useState(true);
  const [voicesReady, setVoicesReady] = React.useState(false);
  // File des segments restants à dire (chunking anti-bug Chromium 15s).
  const queueRef = React.useRef<string[]>([]);
  // Message annoncé via aria-live pour les lecteurs d'écran.
  const [liveMessage, setLiveMessage] = React.useState("");

  // Détection du support + amorçage de la liste de voix (Chrome peuple
  // getVoices() de façon asynchrone — on attend l'événement voiceschanged).
  React.useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const synth = window.speechSynthesis;
    const ready = () => {
      if (synth.getVoices().length > 0) setVoicesReady(true);
    };
    ready();
    synth.addEventListener?.("voiceschanged", ready);
    // Filet de sécurité : si voiceschanged ne se déclenche jamais (Linux
    // sans eSpeak, webview embarqué), on considère le bouton utilisable
    // après 1,5 s — la lecture utilisera la voix système par défaut.
    const t = window.setTimeout(() => setVoicesReady(true), 1500);
    return () => {
      synth.removeEventListener?.("voiceschanged", ready);
      window.clearTimeout(t);
    };
  }, []);

  // Si la prop `text` change ou que le composant est démonté, on coupe la
  // lecture en cours. Une seule narration active à la fois sur la page.
  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      queueRef.current = [];
    };
  }, [text]);

  const pickVoice = React.useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    const preferred = voices.find(
      (v) =>
        /^fr/i.test(v.lang) &&
        /(Google|Microsoft|Amélie|Thomas|Audrey|Marie|Hortense|Paul)/i.test(
          v.name,
        ),
    );
    if (preferred) return preferred;
    return voices.find((v) => /^fr/i.test(v.lang)) ?? null;
  }, []);

  const speakNext = React.useCallback(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const next = queueRef.current.shift();
    if (!next) {
      setStatus("idle");
      setLiveMessage("Lecture terminée");
      return;
    }
    const u = new SpeechSynthesisUtterance(next);
    const voice = pickVoice();
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = "fr-FR";
    }
    u.rate = 0.95;
    u.pitch = 1;
    u.onend = () => {
      if (queueRef.current.length > 0) {
        speakNext();
      } else {
        setStatus("idle");
        setLiveMessage("Lecture terminée");
      }
    };
    u.onerror = () => {
      queueRef.current = [];
      setStatus("idle");
    };
    synth.speak(u);
  }, [supported, pickVoice]);

  const play = React.useCallback(() => {
    if (!supported || !text.trim()) return;
    const synth = window.speechSynthesis;
    // Coupe toute lecture en cours (un autre bouton peut être actif).
    synth.cancel();
    queueRef.current = chunkForTTS(text);
    if (queueRef.current.length === 0) return;
    setStatus("playing");
    setLiveMessage("Lecture démarrée");
    // Anti-race Chromium : cancel() est asynchrone — on attend une frame
    // avant le premier speak(), sinon il est parfois ignoré.
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => speakNext());
    } else {
      window.setTimeout(() => speakNext(), 0);
    }
  }, [supported, text, speakNext]);

  const pause = React.useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
    setLiveMessage("Lecture en pause");
  }, [supported]);

  const resume = React.useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus("playing");
    setLiveMessage("Lecture reprise");
  }, [supported]);

  const stop = React.useCallback(() => {
    if (!supported) return;
    queueRef.current = [];
    window.speechSynthesis.cancel();
    setStatus("idle");
    setLiveMessage("Lecture arrêtée");
  }, [supported]);

  if (!supported) return null;
  const disabled = !text.trim();

  const sizeBtn = compact ? "h-7 w-7 p-0" : "px-2.5 py-1 gap-1.5";
  const baseBtn =
    "inline-flex items-center justify-center rounded-md border text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      role="group"
      aria-label="Lecture audio"
    >
      {/* Région d'annonce pour lecteurs d'écran. Visuellement cachée. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </span>

      {status === "idle" ? (
        <button
          type="button"
          onClick={play}
          disabled={disabled}
          className={cn(
            baseBtn,
            sizeBtn,
            "border-ew-purple-300 bg-ew-purple-50/60 text-ew-purple-700 hover:bg-ew-purple-100",
          )}
          aria-label={`${label} — lecture audio`}
          title={
            voicesReady
              ? `${label} (lecture audio)`
              : `${label} — voix système par défaut`
          }
        >
          {compact ? (
            <Volume2 aria-hidden className="h-3.5 w-3.5" />
          ) : (
            <>
              <Volume2 aria-hidden className="h-3.5 w-3.5" />
              <span>{label}</span>
            </>
          )}
        </button>
      ) : null}

      {status === "playing" ? (
        <>
          <button
            type="button"
            onClick={pause}
            className={cn(
              baseBtn,
              sizeBtn,
              "border-ew-gold-400 bg-ew-gold-50 text-ew-gold-700 hover:bg-ew-gold-100",
            )}
            aria-label="Mettre la lecture en pause"
            title="Pause"
          >
            {compact ? (
              <Pause aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <>
                <Pause aria-hidden className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={stop}
            className={cn(
              baseBtn,
              "h-7 w-7 p-0 border-border bg-card text-muted-foreground hover:bg-muted/40",
            )}
            aria-label="Arrêter la lecture"
            title="Arrêter"
          >
            <Square aria-hidden className="h-3 w-3" />
          </button>
        </>
      ) : null}

      {status === "paused" ? (
        <>
          <button
            type="button"
            onClick={resume}
            className={cn(
              baseBtn,
              sizeBtn,
              "border-ew-green-400 bg-ew-green-50 text-ew-green-800 hover:bg-ew-green-100",
            )}
            aria-label="Reprendre la lecture"
            title="Reprendre"
          >
            {compact ? (
              <Play aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <>
                <Play aria-hidden className="h-3.5 w-3.5" />
                <span>Reprendre</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={stop}
            className={cn(
              baseBtn,
              "h-7 w-7 p-0 border-border bg-card text-muted-foreground hover:bg-muted/40",
            )}
            aria-label="Arrêter la lecture"
            title="Arrêter"
          >
            <Square aria-hidden className="h-3 w-3" />
          </button>
        </>
      ) : null}
    </div>
  );
}
