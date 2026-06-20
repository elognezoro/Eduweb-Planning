import * as React from "react";
import {
  GraduationCap,
  Landmark,
  Star,
  Presentation,
  CalendarDays,
} from "lucide-react";

/* ============================================================================
   Certificat d'achèvement de formation — rendu visuel imprimable (A4 paysage).

   Reproduction du modèle officiel EduWeb (cadre vert & or, ruban, sceau).
   Tous les textes dynamiques sont auto-ajustés (taille via clamp + retour à la
   ligne maîtrisé) pour ne jamais déborder du cadre.
   ========================================================================== */

export interface CourseCertificateProps {
  certNumber: string;
  beneficiaryName: string;
  courseTitle: string;
  trainerName?: string;
  dateLabel: string;
  dgName?: string;
  dgFunction?: string;
  signatureUrl?: string | null;
  stampUrl?: string | null;
}

/** Petite fioriture décorative dorée (séparateur). */
function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="56"
      height="12"
      viewBox="0 0 56 12"
      aria-hidden
      className="text-ew-gold-500"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M0 6h34M40 6h16M37 6l-3-3M37 6l-3 3"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="40" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}

/** Ornement d'angle façon art-déco. */
function CornerOrnament({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[pos];
  const place = {
    tl: { top: 10, left: 10 },
    tr: { top: 10, right: 10 },
    bl: { bottom: 10, left: 10 },
    br: { bottom: 10, right: 10 },
  }[pos];
  return (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      aria-hidden
      className="absolute text-ew-gold-500"
      style={{ ...place, transform: `rotate(${rot}deg)` }}
    >
      <path
        d="M4 54V14a10 10 0 0 1 10-10h40"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
      <path
        d="M12 54V20a8 8 0 0 1 8-8h34"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <rect x="10" y="10" width="7" height="7" fill="currentColor" />
    </svg>
  );
}

function shrink(
  text: string,
  base: number,
  longThreshold: number,
  min: number,
): string {
  // Taille de police en rem, réduite si le texte est long (anti-débordement).
  if (text.length <= longThreshold) return `${base}rem`;
  const ratio = longThreshold / text.length;
  return `${Math.max(min, base * ratio).toFixed(2)}rem`;
}

export function CourseCertificate({
  certNumber,
  beneficiaryName,
  courseTitle,
  trainerName,
  dateLabel,
  dgName,
  dgFunction = "Directeur Général",
  signatureUrl,
  stampUrl,
}: CourseCertificateProps) {
  return (
    <div className="certificate-print mx-auto w-full max-w-[1123px]">
      {/* Cadre extérieur vert */}
      <div
        className="relative aspect-[1.414/1] w-full overflow-hidden rounded-md p-[10px]"
        style={{
          background:
            "linear-gradient(135deg, #0f3d2e 0%, #14532d 40%, #0c2a4d 100%)",
        }}
      >
        {/* Coins navy en diagonale */}
        <div
          aria-hidden
          className="absolute left-0 top-0 h-40 w-40"
          style={{
            background: "#0c2a4d",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 h-40 w-40"
          style={{
            background: "#0c2a4d",
            clipPath: "polygon(0 0, 0 100%, 100% 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 h-40 w-40"
          style={{
            background: "#0c2a4d",
            clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 h-40 w-40"
          style={{
            background: "#0c2a4d",
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* Liseré or */}
        <div className="relative h-full w-full rounded-sm border-2 border-ew-gold-500 p-[6px]">
          <div className="relative h-full w-full rounded-sm border border-ew-gold-400/70 bg-[#fbfaf5]">
            <CornerOrnament pos="tl" />
            <CornerOrnament pos="tr" />
            <CornerOrnament pos="bl" />
            <CornerOrnament pos="br" />

            {/* Contenu */}
            <div className="relative flex h-full flex-col items-center px-[6%] py-[3.5%] text-center">
              {/* Ruban + écusson haut-centre */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2">
                <div
                  className="flex h-[88px] w-[72px] items-start justify-center pt-2"
                  style={{
                    background: "linear-gradient(#14532d,#0f3d2e)",
                    clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)",
                  }}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ew-gold-500 bg-[#0f3d2e] text-ew-gold-400">
                    <GraduationCap className="h-6 w-6" />
                  </span>
                </div>
              </div>

              {/* N° de certificat (haut droite) */}
              <div className="absolute right-[7%] top-[6%] text-right">
                <p className="text-[11px] font-semibold tracking-wide text-[#0c2a4d]">
                  N° de certificat :
                </p>
                <p className="font-mono text-xs font-bold text-ew-green-900">
                  {certNumber}
                </p>
              </div>

              {/* Titre */}
              <h1
                className="mt-[7%] font-display font-extrabold uppercase leading-tight tracking-wide text-ew-green-900"
                style={{ fontSize: "clamp(1.4rem, 3.6vw, 2.6rem)" }}
              >
                Certificat d&apos;achèvement de formation
              </h1>
              <div className="mt-1 flex items-center gap-3">
                <Flourish />
                <p className="font-display text-lg font-bold text-[#0c2a4d] sm:text-xl">
                  EdTech EduWeb
                </p>
                <Flourish flip />
              </div>

              {/* Décerné à */}
              <p className="mt-[3%] flex items-center gap-2 text-sm text-foreground/80">
                <Flourish />
                <span>Ce certificat est décerné à :</span>
                <Flourish flip />
              </p>
              <p
                className="mt-1 w-[80%] truncate border-b border-ew-gold-400 pb-1 font-display font-bold text-ew-green-900"
                style={{ fontSize: shrink(beneficiaryName || " ", 1.9, 26, 1) }}
                title={beneficiaryName}
              >
                {beneficiaryName || " "}
              </p>

              {/* Formation suivie */}
              <p className="mt-[2.5%] flex items-center gap-2 text-sm text-foreground/80">
                <Flourish />
                <span>Pour avoir suivi avec succès la formation :</span>
                <Flourish flip />
              </p>
              <p
                className="mt-1 line-clamp-2 w-[82%] border-b border-ew-gold-400 pb-1 font-display font-bold text-[#0c2a4d]"
                style={{ fontSize: shrink(courseTitle || " ", 1.35, 40, 0.9) }}
                title={courseTitle}
              >
                {courseTitle || " "}
              </p>

              <p className="mt-[2.5%] text-sm italic text-foreground/75">
                En reconnaissance de son engagement et de sa participation
                active.
              </p>

              {/* Pied : Formateur · Sceau · Date & signature */}
              <div className="mt-auto grid w-full grid-cols-3 items-end gap-2 pt-[2%]">
                {/* Formateur */}
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ew-green-900 text-ew-gold-400">
                    <Presentation className="h-4 w-4" />
                  </span>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#0c2a4d]">
                    Formateur :
                  </p>
                  <p
                    className="mt-3 w-full truncate border-t border-ew-gold-400 pt-1 text-sm font-bold text-ew-green-900"
                    title={trainerName}
                  >
                    {trainerName?.trim() || " "}
                  </p>
                </div>

                {/* Sceau central + signataire */}
                <div className="flex flex-col items-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    {/* rubans */}
                    <span
                      aria-hidden
                      className="absolute -bottom-2 left-1/2 h-5 w-3 -translate-x-3 rotate-[-12deg] bg-ew-green-800"
                      style={{
                        clipPath:
                          "polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="absolute -bottom-2 left-1/2 h-5 w-3 translate-x-0 rotate-[12deg] bg-ew-green-800"
                      style={{
                        clipPath:
                          "polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)",
                      }}
                    />
                    <span className="absolute inset-0 rounded-full bg-ew-gold-500" />
                    <span className="absolute inset-[3px] rounded-full bg-ew-gold-300" />
                    <span className="absolute inset-[6px] flex items-center justify-center rounded-full bg-ew-green-900 text-ew-gold-300">
                      <Landmark className="h-6 w-6" />
                    </span>
                    <Star
                      className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 fill-ew-gold-400 text-ew-gold-400"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-2 font-display text-sm font-extrabold text-ew-green-900">
                    {dgName?.trim() || " "}
                  </p>
                  <p className="text-[11px] italic text-foreground/70">
                    {dgFunction}
                  </p>
                </div>

                {/* Date & signature + cachet */}
                <div className="relative flex flex-col items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ew-green-900 text-ew-gold-400">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#0c2a4d]">
                    Date et signature :
                  </p>
                  {/* Signature (au-dessus de la ligne) */}
                  <div className="relative mt-1 flex h-10 w-full items-end justify-center">
                    {signatureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="max-h-10 max-w-[70%] object-contain"
                      />
                    ) : null}
                    {/* Cachet : taille réduite, décalé pour ne pas masquer le texte */}
                    {stampUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stampUrl}
                        alt="Cachet"
                        aria-hidden
                        className="pointer-events-none absolute right-1 top-[-6px] h-16 w-16 object-contain opacity-80"
                      />
                    ) : null}
                  </div>
                  <p className="w-full border-t border-ew-gold-400 pt-1 text-xs font-semibold text-ew-green-900">
                    {dateLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
