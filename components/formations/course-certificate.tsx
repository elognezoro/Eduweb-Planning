import * as React from "react";

/* ============================================================================
   Certificat d'achèvement de formation.

   Le visuel officiel est l'image `public/certificat-modele.png` (cadre, ruban,
   médaille, libellés et signataire « Elogne ZORO / Directeur Général » déjà
   intégrés). On l'utilise en FOND et on incruste uniquement les données
   dynamiques aux emplacements prévus :
     - N° de certificat, NOM Prénoms du bénéficiaire, intitulé de la formation,
       nom du formateur, date, signature et cachet.
   Les textes sont auto-ajustés (taille via clamp + troncature) pour ne jamais
   déborder. Format de l'image : 1448 × 1086 (4:3).

   Pour caler finement un champ, ajuster les pourcentages dans POS ci-dessous.
   ========================================================================== */

export interface CourseCertificateProps {
  certNumber: string;
  beneficiaryName: string;
  courseTitle: string;
  trainerName?: string;
  dateLabel: string;
  /** Conservés pour compat — le signataire est déjà imprimé dans l'image. */
  dgName?: string;
  dgFunction?: string;
  signatureUrl?: string | null;
  stampUrl?: string | null;
}

const SERIF = 'Georgia, "Times New Roman", serif';
const GREEN = "#13402f";
const NAVY = "#13315c";

/** Emplacements (en % du cadre) des données incrustées — faciles à régler. */
const POS = {
  // Lignes du modèle (mesurées) : nom 47,3% · formation 58% · formateur/date 83,5%.
  number: { left: "84.5%", top: "20.4%", maxW: "17%" },
  name: { left: "50%", top: "45.6%", maxW: "60%" },
  course: { left: "50%", top: "57%", maxW: "62%", height: "13%" },
  trainer: { left: "18.3%", top: "81.8%", maxW: "28%" },
  date: { left: "81.4%", top: "81.8%", maxW: "21%" },
  sign: { left: "81.4%", top: "79.6%", maxW: "20%" },
} as const;

function Centered({
  left,
  top,
  maxW,
  height,
  children,
}: {
  left: string;
  top: string;
  maxW: string;
  height?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 text-center leading-tight"
      style={{ left, top, width: maxW, maxWidth: maxW, height }}
    >
      {children}
    </div>
  );
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Texte auto-ajusté : réduit (ou agrandit jusqu'à maxPx) la taille de police par
 * recherche dichotomique pour que le texte tienne EXACTEMENT dans son cadre
 * (largeur, et hauteur si le cadre a une hauteur fixe). Recalcule au redimensionnement.
 * - mode 1 ligne (multiline=false) : ajuste à la largeur (nom de formateur complet).
 * - mode multi-lignes (multiline) : enroule + centre verticalement (titre de formation).
 */
function FitText({
  text,
  maxPx,
  minPx = 8,
  color,
  multiline = false,
  title,
}: {
  text: string;
  maxPx: number;
  minPx?: number;
  color?: string;
  multiline?: boolean;
  title?: string;
}) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const spanRef = React.useRef<HTMLSpanElement>(null);

  useIsoLayoutEffect(() => {
    const box = boxRef.current;
    const span = spanRef.current;
    if (!box || !span) return;
    const fit = () => {
      let lo = minPx;
      let hi = maxPx;
      let best = minPx;
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        span.style.fontSize = `${mid}px`;
        const fitsW = span.scrollWidth <= box.clientWidth + 0.5;
        const fitsH = box.clientHeight === 0 || span.scrollHeight <= box.clientHeight + 0.5;
        if (fitsW && fitsH) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      span.style.fontSize = `${best}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text, maxPx, minPx, multiline]);

  return (
    <div
      ref={boxRef}
      title={title}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <span
        ref={spanRef}
        className={`font-bold ${multiline ? "max-w-full whitespace-normal text-balance" : "whitespace-nowrap"}`}
        style={{ color, lineHeight: 1.15 }}
      >
        {text || " "}
      </span>
    </div>
  );
}

export function CourseCertificate({
  certNumber,
  beneficiaryName,
  courseTitle,
  trainerName,
  dateLabel,
  signatureUrl,
  stampUrl,
}: CourseCertificateProps) {
  return (
    <div
      className="certificate-print mx-auto w-full max-w-[1100px]"
      style={{ fontFamily: SERIF }}
    >
      <div className="relative w-full" style={{ aspectRatio: "1448 / 1086" }}>
        {/* Fond : modèle officiel */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/certificat-modele.png"
          alt="Certificat d'achèvement de formation EduWeb"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Données incrustées */}
        <div className="absolute inset-0" style={{ color: GREEN }}>
          {/* N° de certificat — auto-ajusté pour tenir entre les lauriers */}
          <Centered {...POS.number}>
            <span
              className="block truncate whitespace-nowrap font-bold tracking-wide"
              style={{ fontSize: "clamp(0.45rem, 0.95vw, 0.78rem)" }}
              title={certNumber}
            >
              {certNumber}
            </span>
          </Centered>

          {/* NOM Prénoms */}
          <Centered {...POS.name}>
            <span
              className="block truncate font-bold"
              style={{ fontSize: "clamp(1rem, 3vw, 2.3rem)" }}
              title={beneficiaryName}
            >
              {beneficiaryName || " "}
            </span>
          </Centered>

          {/* Intitulé de la formation — centré et auto-ajusté (largeur + hauteur)
             dans la bande entre les deux lignes orange. */}
          <Centered {...POS.course}>
            <FitText
              text={courseTitle}
              maxPx={34}
              minPx={9}
              color={NAVY}
              multiline
              title={courseTitle}
            />
          </Centered>

          {/* Formateur — NOM COMPLET, taille auto-ajustée à la largeur disponible. */}
          <Centered {...POS.trainer}>
            <FitText
              text={(trainerName ?? "").trim()}
              maxPx={24}
              minPx={8}
              color={GREEN}
              title={trainerName}
            />
          </Centered>

          {/* Date */}
          <Centered {...POS.date}>
            <span
              className="block truncate font-bold"
              style={{ fontSize: "clamp(0.62rem, 1.4vw, 1.05rem)" }}
            >
              {dateLabel}
            </span>
          </Centered>

          {/* Signature + cachet (au-dessus de la ligne « Date et signature ») */}
          {signatureUrl || stampUrl ? (
            <Centered {...POS.sign}>
              <div
                className="relative flex items-end justify-center"
                style={{ height: "3.2vw", minHeight: 22 }}
              >
                {signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    className="max-h-full max-w-[70%] object-contain"
                    // mix-blend multiply : le fond clair de l'image disparaît sur
                    // le certificat (équivaut à un fond transparent).
                    style={{ mixBlendMode: "multiply" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                {stampUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={stampUrl}
                    alt="Cachet"
                    aria-hidden
                    className="pointer-events-none absolute -top-[1.6vw] right-0 object-contain opacity-90"
                    style={{
                      height: "5.4vw",
                      width: "5.4vw",
                      maxHeight: 78,
                      maxWidth: 78,
                      mixBlendMode: "multiply",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
              </div>
            </Centered>
          ) : null}
        </div>
      </div>
    </div>
  );
}
