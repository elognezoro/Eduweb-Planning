import * as React from "react";

/* ============================================================================
   Certificat d'achèvement de formation — rendu visuel imprimable (A4 paysage).

   Décor entièrement VECTORIEL (SVG) : cadre vert sombre, rubans navy aux angles,
   liseré or ouvragé avec ornements art-déco, ruban-écusson sommital, médaille à
   couronne de laurier, texture hexagonale discrète. Le texte dynamique est posé
   en HTML par-dessus (typographie serif en petites capitales), auto-ajusté pour
   ne jamais déborder du cadre.
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

const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
const GREEN = "#0f3d2e";
const GREEN_DEEP = "#0b2c21";
const NAVY = "#0c2a4d";

/** Réduit la taille de police (rem) si le texte est long (anti-débordement). */
function shrink(
  text: string,
  base: number,
  threshold: number,
  min: number,
): string {
  if (text.length <= threshold) return `${base}rem`;
  return `${Math.max(min, base * (threshold / text.length)).toFixed(2)}rem`;
}

/** Filet doré décoratif avec feuilles aux extrémités (séparateur). */
function GoldRule({ width = "78%" }: { width?: string }) {
  return (
    <div className="flex items-center justify-center" style={{ width }}>
      <Leaf />
      <span
        className="mx-1 h-px flex-1"
        style={{
          background:
            "linear-gradient(90deg,transparent,#c9a227 12%,#e7c96a 50%,#c9a227 88%,transparent)",
        }}
      />
      <Leaf flip />
    </div>
  );
}

function Leaf({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="22"
      height="10"
      viewBox="0 0 22 10"
      aria-hidden
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M21 5H7" stroke="#c9a227" strokeWidth="1.2" />
      <path
        d="M7 5c0-3 4-4 6-4-1 3-3 4-6 4Zm0 0c0 3 4 4 6 4-1-3-3-4-6-4Z"
        fill="#c9a227"
      />
      <circle cx="3" cy="5" r="2.1" fill="#c9a227" />
    </svg>
  );
}

/** Petite fioriture latérale (autour des intitulés). */
function Sprig({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="40"
      height="14"
      viewBox="0 0 40 14"
      aria-hidden
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      className="shrink-0"
    >
      <path
        d="M2 7h22"
        stroke="#c9a227"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M24 7l-5-4M24 7l-5 4"
        stroke="#c9a227"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M30 7c3-1 6-1 8 0-3 1-6 1-8 0Z" fill="#c9a227" />
      <path
        d="M30 4c2-1 4-2 6-1-2 1-4 2-6 1Zm0 6c2 1 4 2 6 1-2-1-4-2-6-1Z"
        fill="#c9a227"
        opacity="0.85"
      />
    </svg>
  );
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
    <div
      className="certificate-print mx-auto w-full max-w-[1123px]"
      style={{ fontFamily: SERIF }}
    >
      <div className="relative aspect-[1.414/1] w-full">
        {/* ---------- DÉCOR VECTORIEL ---------- */}
        <svg
          viewBox="0 0 1123 794"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a9801c" />
              <stop offset="0.35" stopColor="#f3dd8e" />
              <stop offset="0.55" stopColor="#d4af37" />
              <stop offset="1" stopColor="#9c7416" />
            </linearGradient>
            <linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f0d586" />
              <stop offset="0.5" stopColor="#cda32f" />
              <stop offset="1" stopColor="#8f6a12" />
            </linearGradient>
            <linearGradient id="greenRibbon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1c5c41" />
              <stop offset="1" stopColor={GREEN_DEEP} />
            </linearGradient>
            <pattern
              id="hex"
              width="34"
              height="58"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1)"
            >
              <path
                d="M17 0l17 9.8v19.6L17 39 0 29.4V9.8zM17 39l17 9.8v19.6L17 78 0 68.4V48.8z"
                fill="none"
                stroke="#caa94e"
                strokeWidth="0.6"
                opacity="0.10"
              />
            </pattern>
            <radialGradient id="sealGlow" cx="0.5" cy="0.4" r="0.65">
              <stop offset="0" stopColor="#1e6a49" />
              <stop offset="1" stopColor={GREEN_DEEP} />
            </radialGradient>
          </defs>

          {/* Fond / cadre vert */}
          <rect x="0" y="0" width="1123" height="794" rx="6" fill={GREEN} />

          {/* Rubans navy en diagonale aux 4 angles, lisérés d'or */}
          {[
            { p: "M0,0 L235,0 L0,235 Z", g: "M0,0 L235,0 L0,235 Z" },
            { p: "M1123,0 L888,0 L1123,235 Z" },
            { p: "M0,794 L235,794 L0,559 Z" },
            { p: "M1123,794 L888,794 L1123,559 Z" },
          ].map((c, i) => (
            <path key={i} d={c.p} fill={NAVY} />
          ))}
          {/* lisérés or des rubans */}
          {[
            "M210,0 L0,210",
            "M913,0 L1123,210",
            "M210,794 L0,584",
            "M913,794 L1123,584",
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              stroke="url(#gold)"
              strokeWidth="4"
              fill="none"
            />
          ))}

          {/* Champ crème (pentagone : sommet en pointe sous le ruban) */}
          <path
            d="M40,40 L508,40 L561,86 L615,40 L1083,40 L1083,754 L40,754 Z"
            fill="#faf7ee"
            stroke="#caa94e"
            strokeWidth="1"
          />
          <path
            d="M40,40 L508,40 L561,86 L615,40 L1083,40 L1083,754 L40,754 Z"
            fill="url(#hex)"
          />

          {/* Liseré or ouvragé (double) */}
          <rect
            x="58"
            y="58"
            width="1007"
            height="678"
            fill="none"
            stroke="url(#gold)"
            strokeWidth="2.5"
          />
          <rect
            x="65"
            y="65"
            width="993"
            height="664"
            fill="none"
            stroke="#caa94e"
            strokeWidth="1"
          />

          {/* Ornements d'angle art-déco (sur le liseré or) */}
          {(
            [
              { x: 58, y: 58, sx: 1, sy: 1 },
              { x: 1065, y: 58, sx: -1, sy: 1 },
              { x: 58, y: 736, sx: 1, sy: -1 },
              { x: 1065, y: 736, sx: -1, sy: -1 },
            ] as const
          ).map((o, i) => (
            <g
              key={i}
              transform={`translate(${o.x},${o.y}) scale(${o.sx},${o.sy})`}
              stroke="url(#gold)"
              strokeWidth="2"
              fill="none"
            >
              <path d="M6 64 L6 26 Q6 6 26 6 L64 6" />
              <path d="M16 56 L16 34 Q16 16 34 16 L56 16" />
              <rect
                x="6"
                y="6"
                width="11"
                height="11"
                fill="url(#gold)"
                stroke="none"
              />
              <path d="M30 6 L30 16 M44 6 L44 16 M6 30 L16 30 M6 44 L16 44" />
            </g>
          ))}

          {/* Ruban-écusson sommital */}
          <g>
            <path
              d="M508,40 L614,40 L614,150 L561,124 L508,150 Z"
              fill="url(#greenRibbon)"
              stroke="url(#gold)"
              strokeWidth="2"
            />
            {/* écusson doré */}
            <path
              d="M561,52 L596,64 L596,92 Q596,118 561,132 Q526,118 526,92 L526,64 Z"
              fill="url(#goldV)"
              stroke="#8f6a12"
              strokeWidth="1.5"
            />
            <path
              d="M561,60 L589,70 L589,92 Q589,112 561,124 Q533,112 533,92 L533,70 Z"
              fill={GREEN_DEEP}
            />
            {/* toque + livre + étoile */}
            <path d="M547,86 L561,80 L575,86 L561,92 Z" fill="url(#goldV)" />
            <path
              d="M561,92 L561,99 M567,88 L567,96 q-3,2 -6,2"
              stroke="url(#goldV)"
              strokeWidth="1.4"
              fill="none"
            />
            <path
              d="M549,102 q12,-4 12,0 q0,-4 12,0 v8 q-12,-3 -12,0 q0,-3 -12,0 Z"
              fill="url(#goldV)"
            />
            <path
              d="M561,70 l2,4 4,0 -3,3 1,4 -4,-2 -4,2 1,-4 -3,-3 4,0 Z"
              fill="url(#goldV)"
            />
          </g>

          {/* Médaille centrale (laurier + sceau) */}
          <g transform="translate(561,628)">
            {/* couronne de laurier */}
            {[-1, 1].map((s) => (
              <g key={s} transform={`scale(${s},1)`}>
                {Array.from({ length: 7 }).map((_, k) => {
                  const a = 1.4 + k * 0.28;
                  const x = Math.cos(a) * 60;
                  const y = -Math.sin(a) * 60 + 6;
                  return (
                    <ellipse
                      key={k}
                      cx={x}
                      cy={y}
                      rx="7"
                      ry="3.4"
                      fill="url(#goldV)"
                      transform={`rotate(${(-a * 180) / Math.PI + 90} ${x} ${y})`}
                    />
                  );
                })}
              </g>
            ))}
            {/* rubans sous la médaille */}
            <path
              d="M-12,40 L-22,72 L-10,66 L-6,46 Z"
              fill="#1c5c41"
              stroke="url(#gold)"
              strokeWidth="1"
            />
            <path
              d="M12,40 L22,72 L10,66 L6,46 Z"
              fill="#1c5c41"
              stroke="url(#gold)"
              strokeWidth="1"
            />
            {/* disque or godronné */}
            <circle r="46" fill="url(#gold)" />
            {Array.from({ length: 28 }).map((_, k) => {
              const a = (k / 28) * Math.PI * 2;
              return (
                <circle
                  key={k}
                  cx={Math.cos(a) * 46}
                  cy={Math.sin(a) * 46}
                  r="3.4"
                  fill="url(#goldV)"
                />
              );
            })}
            <circle r="40" fill="url(#goldV)" />
            <circle
              r="33"
              fill="url(#sealGlow)"
              stroke="url(#gold)"
              strokeWidth="2"
            />
            {/* étoiles */}
            {[-12, 0, 12].map((dx, i) => (
              <path
                key={i}
                transform={`translate(${dx},-16)`}
                d="M0,-5 1.5,-1.5 5,-1.5 2,1 3,5 0,2.5 -3,5 -2,1 -5,-1.5 -1.5,-1.5 Z"
                fill="url(#goldV)"
              />
            ))}
            {/* édifice classique */}
            <path d="M-14,-6 L0,-13 L14,-6 Z" fill="url(#goldV)" />
            <rect x="-13" y="-6" width="26" height="3" fill="url(#goldV)" />
            {[-10, -5, 0, 5, 10].map((x) => (
              <rect
                key={x}
                x={x - 1.3}
                y="-3"
                width="2.6"
                height="13"
                fill="url(#goldV)"
              />
            ))}
            <rect x="-14" y="10" width="28" height="3" fill="url(#goldV)" />
          </g>
        </svg>

        {/* ---------- TEXTE (HTML par-dessus) ---------- */}
        <div
          className="absolute inset-0 text-center"
          style={{ color: "#393d34" }}
        >
          {/* N° de certificat */}
          <div className="absolute right-[8%] top-[9%] text-right">
            <p className="text-[12px] tracking-wide" style={{ color: NAVY }}>
              N° de certificat :
            </p>
            <p
              className="font-mono text-[13px] font-bold"
              style={{ color: GREEN }}
            >
              {certNumber}
            </p>
          </div>

          {/* Bloc central */}
          <div className="absolute inset-x-[9%] top-[15%] flex flex-col items-center">
            <h1
              className="font-bold leading-tight"
              style={{
                color: GREEN,
                fontVariant: "small-caps",
                letterSpacing: "0.01em",
                fontSize: "clamp(1.6rem, 4.4vw, 3.2rem)",
              }}
            >
              Certificat d&apos;achèvement de formation
            </h1>

            <div className="mt-1 flex items-center justify-center gap-3">
              <Sprig />
              <p
                className="font-bold"
                style={{ color: NAVY, fontSize: "clamp(1rem,1.9vw,1.5rem)" }}
              >
                EdTech EduWeb
              </p>
              <Sprig flip />
            </div>

            {/* Décerné à */}
            <div className="mt-[5%] flex items-center justify-center gap-3 text-[15px] opacity-85">
              <Sprig />
              <span>Ce certificat est décerné à :</span>
              <Sprig flip />
            </div>
            <p
              className="mt-2 max-w-[80%] truncate font-bold"
              style={{
                color: GREEN,
                fontSize: shrink(beneficiaryName || " ", 2.2, 24, 1.1),
              }}
              title={beneficiaryName}
            >
              {beneficiaryName || " "}
            </p>
            <div className="mt-2">
              <GoldRule width="640px" />
            </div>

            {/* Formation */}
            <div className="mt-[3.5%] flex items-center justify-center gap-3 text-[15px] opacity-85">
              <Sprig />
              <span>Pour avoir suivi avec succès la formation :</span>
              <Sprig flip />
            </div>
            <p
              className="mt-2 line-clamp-2 max-w-[82%] font-bold"
              style={{
                color: NAVY,
                fontSize: shrink(courseTitle || " ", 1.5, 46, 1),
              }}
              title={courseTitle}
            >
              {courseTitle || " "}
            </p>
            <div className="mt-2">
              <GoldRule width="700px" />
            </div>

            <p className="mt-[3.5%] text-[15px] italic opacity-70">
              En reconnaissance de son engagement et de sa participation active.
            </p>
          </div>

          {/* Signataire central (sous la médaille) */}
          <div className="absolute inset-x-0 bottom-[5%] text-center">
            <p
              className="font-bold"
              style={{ color: GREEN, fontSize: "1.1rem" }}
            >
              {dgName?.trim() || " "}
            </p>
            <p className="text-[12px] italic opacity-70">{dgFunction}</p>
          </div>

          {/* Formateur (gauche) */}
          <div className="absolute bottom-[8%] left-[9%] w-[24%] text-center">
            <p
              className="text-[12px] font-semibold uppercase tracking-wide"
              style={{ color: NAVY }}
            >
              Formateur :
            </p>
            <p
              className="mt-6 truncate border-t pt-1 text-[15px] font-bold"
              style={{ color: GREEN, borderColor: "#caa94e" }}
              title={trainerName}
            >
              {trainerName?.trim() || " "}
            </p>
          </div>

          {/* Date & signature (droite) + cachet */}
          <div className="absolute bottom-[8%] right-[9%] w-[24%] text-center">
            <p
              className="text-[12px] font-semibold uppercase tracking-wide"
              style={{ color: NAVY }}
            >
              Date et signature :
            </p>
            <div className="relative mx-auto flex h-9 w-full items-end justify-center">
              {signatureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signatureUrl}
                  alt="Signature"
                  className="max-h-9 max-w-[65%] object-contain"
                />
              ) : null}
              {stampUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stampUrl}
                  alt="Cachet"
                  aria-hidden
                  className="pointer-events-none absolute -top-2 right-0 h-14 w-14 object-contain opacity-85"
                />
              ) : null}
            </div>
            <p
              className="border-t pt-1 text-[14px] font-bold"
              style={{ color: GREEN, borderColor: "#caa94e" }}
            >
              {dateLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
