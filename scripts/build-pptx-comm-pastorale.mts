/* ============================================================================
   Génère des PowerPoint (.pptx) PROPRES pour les séminaires SENEC :
   - « Le numérique au service de la communication éducative et pastorale »
   - « L'intelligence artificielle au service de la communication… » (IA)

   Pourquoi ce script : les anciens support.pptx (decks d'origine) étaient mal
   agencés et par endroits illisibles (zones de texte qui se chevauchent,
   débordements). On régénère les decks PAR PROGRAMME à partir du CONTENU
   STRUCTURÉ déjà maintenu dans le code (lib/seminaires/*.ts), avec un moteur de
   mise en page séquentiel : chaque bloc occupe une région bornée et NON
   chevauchante, et tout texte est en `fit: "shrink"` → aucun débordement.

   Les deux séminaires partagent le modèle `CommSeminaire` / `CommSlide`, d'où un
   générateur unique paramétré par le séminaire.

   Exécution :  npx tsx scripts/build-pptx-comm-pastorale.mts
   Sorties   :  public/seminaires/communication-pastorale/support.pptx
                public/seminaires/ia-communication/support.pptx
   ========================================================================== */

import { fileURLToPath } from "node:url";
import path from "node:path";
import pptxgenImport from "pptxgenjs";
import {
  COMMUNICATION_PASTORALE,
  type CommSeminaire,
  type CommSlide,
  type CommSlideBlock,
} from "../lib/seminaires/communication-pastorale";
import { IA_COMMUNICATION } from "../lib/seminaires/ia-communication";

// Interop ESM/CJS : selon le chargeur, le constructeur est le défaut ou le module.
const PptxCtor: any = (pptxgenImport as any)?.default ?? pptxgenImport;
type Slide = any;

/* -------- Palette (alignée sur l'identité EduWeb + le livret DOCX) -------- */
const C = {
  ink: "1B2A22",
  green: "176B45",
  greenDark: "0E2A1E",
  gold: "D99A1E",
  goldSoft: "F7EFD9",
  gray: "5A6660",
  cream: "F6F2EA",
  white: "FFFFFF",
  cardFill: "FFFFFF",
  cardLine: "E3E7E3",
};

const TONE: Record<string, { fill: string; bar: string }> = {
  info: { fill: "E9EEFA", bar: "1E40AF" },
  pastoral: { fill: "F0EAFA", bar: "7C4DBC" },
  warning: { fill: "FBF1DA", bar: "D99A1E" },
  success: { fill: "E6F2EB", bar: "176B45" },
  default: { fill: "E6F2EB", bar: "176B45" },
};

const FONT = "Arial";

/* -------- Géométrie 16:9 (pouces) -------- */
const PAGE_W = 13.333;
const PAGE_H = 7.5;
const MX = 0.62;
const CONTENT_W = PAGE_W - 2 * MX;

type Region = { x: number; y: number; w: number; h: number };

/* ===========================================================================
   Construit le deck d'UN séminaire et l'écrit sur disque.
   ======================================================================== */
async function generate(seminaire: CommSeminaire, outAbsPath: string) {
  const pptx = new PptxCtor();
  pptx.defineLayout({ name: "WIDE", width: PAGE_W, height: PAGE_H });
  pptx.layout = "WIDE";
  pptx.author = "EduWeb Planner";
  pptx.company = "SENEC — Secrétariat National de l'Enseignement Catholique";
  pptx.subject = seminaire.meta.title;
  pptx.title = seminaire.meta.title;

  const S = pptx.ShapeType;
  const TOTAL = seminaire.slides.length;
  const REF_DATE = seminaire.meta.referenceDate;

  /* -------- En-tête commun (diapositives standard). Renvoie la zone de contenu. */
  function addHeader(slide: Slide, s: CommSlide): Region {
    slide.addShape(S.rect, { x: 0, y: 0, w: PAGE_W, h: 0.12, fill: { color: C.green } });
    slide.addShape(S.rect, { x: 0, y: 0, w: 3.2, h: 0.12, fill: { color: C.gold } });

    slide.addText(`DIAPOSITIVE ${String(s.num).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`, {
      x: MX, y: 0.34, w: 6, h: 0.3, fontFace: FONT, fontSize: 11, bold: true,
      color: C.gold, charSpacing: 2, align: "left", valign: "middle",
    });
    slide.addText(s.title, {
      x: MX, y: 0.66, w: CONTENT_W, h: 0.92, fontFace: FONT, fontSize: 26, bold: true,
      color: C.green, align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 0.98,
    });

    let headerBottom = 1.62;
    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: MX, y: 1.6, w: CONTENT_W, h: 0.5, fontFace: FONT, fontSize: 13.5, italic: true,
        color: C.gray, align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 0.98,
      });
      headerBottom = 2.12;
    }
    slide.addShape(S.rect, { x: MX, y: headerBottom + 0.04, w: 1.5, h: 0.045, fill: { color: C.gold } });

    const top = headerBottom + 0.22;
    const bottom = s.footer ? 6.62 : 7.0;
    return { x: MX, y: top, w: CONTENT_W, h: bottom - top };
  }

  /* -------- Pied : encadré « repère », pastille de page, étiquette SENEC. */
  function addFooter(slide: Slide, s: CommSlide) {
    if (s.footer) {
      slide.addShape(S.roundRect, {
        x: MX, y: 6.72, w: CONTENT_W, h: 0.5, rectRadius: 0.06,
        fill: { color: C.goldSoft }, line: { type: "none" },
      });
      slide.addShape(S.rect, { x: MX, y: 6.72, w: 0.07, h: 0.5, fill: { color: C.gold } });
      slide.addText(s.footer, {
        x: MX + 0.18, y: 6.72, w: CONTENT_W - 0.34, h: 0.5, fontFace: FONT, fontSize: 11.5,
        italic: true, color: C.ink, align: "left", valign: "middle", fit: "shrink",
      });
    }
    slide.addText(`SENEC · ${REF_DATE}`, {
      x: MX, y: 7.18, w: 5, h: 0.26, fontFace: FONT, fontSize: 9, color: C.gray, align: "left", valign: "middle",
    });
    slide.addText(`${s.num} / ${TOTAL}`, {
      x: PAGE_W - MX - 2, y: 7.18, w: 2, h: 0.26, fontFace: FONT, fontSize: 9, bold: true,
      color: C.gray, align: "right", valign: "middle",
    });
  }

  function blockWeight(b: CommSlideBlock): number {
    switch (b.kind) {
      case "highlight":
        return 0.9;
      case "flow":
        return 0.8;
      case "paragraph":
        return b.tone === "lead" ? 1.0 : 0.8;
      default:
        return 2.4;
    }
  }

  function renderBlocks(slide: Slide, blocks: CommSlideBlock[], region: Region) {
    const gap = 0.2;
    const weights = blocks.map(blockWeight);
    const totalW = weights.reduce((a, b) => a + b, 0);
    const availH = region.h - gap * (blocks.length - 1);
    let cy = region.y;
    blocks.forEach((b, i) => {
      const h = availH * (weights[i] / totalW);
      renderBlock(slide, b, { x: region.x, y: cy, w: region.w, h });
      cy += h + gap;
    });
  }

  function cardGrid(
    slide: Slide,
    items: { label: string; title: string; description: string }[],
    region: Region,
    opts: { cols: number; bigLetter?: boolean },
  ) {
    const { cols } = opts;
    const rows = Math.ceil(items.length / cols);
    const gx = 0.22;
    const gy = 0.2;
    const cw = (region.w - gx * (cols - 1)) / cols;
    const ch = (region.h - gy * (rows - 1)) / rows;

    items.forEach((it, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const x = region.x + c * (cw + gx);
      const y = region.y + r * (ch + gy);

      slide.addShape(S.roundRect, {
        x, y, w: cw, h: ch, rectRadius: 0.08,
        fill: { color: C.cardFill }, line: { color: C.cardLine, width: 1 },
        shadow: { type: "outer", color: "C8CFC9", blur: 4, offset: 1, angle: 90, opacity: 0.4 },
      });
      slide.addShape(S.rect, { x, y, w: 0.08, h: ch, fill: { color: C.green } });

      const pad = 0.18;
      const innerX = x + pad + 0.04;
      const innerW = cw - 2 * pad;

      if (opts.bigLetter) {
        slide.addText(it.label, {
          x: innerX, y: y + pad - 0.04, w: innerW, h: 0.7, fontFace: FONT, fontSize: 34, bold: true,
          color: C.gold, align: "left", valign: "top", fit: "shrink",
        });
        slide.addText(it.title, {
          x: innerX, y: y + pad + 0.62, w: innerW, h: 0.4, fontFace: FONT, fontSize: 14, bold: true,
          color: C.green, align: "left", valign: "top", fit: "shrink",
        });
        slide.addText(it.description, {
          x: innerX, y: y + pad + 1.02, w: innerW, h: ch - 1.02 - pad, fontFace: FONT, fontSize: 11.5,
          color: C.ink, align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 1.0,
        });
      } else {
        slide.addText(it.label.toUpperCase(), {
          x: innerX, y: y + pad - 0.02, w: innerW, h: 0.3, fontFace: FONT, fontSize: 11, bold: true,
          color: C.gold, charSpacing: 1, align: "left", valign: "top", fit: "shrink",
        });
        slide.addText(it.title, {
          x: innerX, y: y + pad + 0.28, w: innerW, h: 0.46, fontFace: FONT, fontSize: 14.5, bold: true,
          color: C.green, align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 0.98,
        });
        slide.addText(it.description, {
          x: innerX, y: y + pad + 0.76, w: innerW, h: ch - 0.76 - pad, fontFace: FONT, fontSize: 11.5,
          color: C.ink, align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 1.0,
        });
      }
    });
  }

  function renderBlock(slide: Slide, b: CommSlideBlock, region: Region) {
    switch (b.kind) {
      case "paragraph": {
        slide.addText(b.text, {
          ...region, fontFace: FONT, fontSize: b.tone === "lead" ? 16 : 13.5,
          bold: b.tone === "lead", italic: b.tone === "muted", color: b.tone === "muted" ? C.gray : C.ink,
          align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 1.05,
        });
        return;
      }
      case "highlight": {
        const t = TONE[b.tone ?? "default"] ?? TONE.default;
        slide.addShape(S.roundRect, {
          x: region.x, y: region.y, w: region.w, h: region.h, rectRadius: 0.07,
          fill: { color: t.fill }, line: { type: "none" },
        });
        slide.addShape(S.rect, { x: region.x, y: region.y, w: 0.08, h: region.h, fill: { color: t.bar } });
        slide.addText(b.text, {
          x: region.x + 0.24, y: region.y, w: region.w - 0.44, h: region.h, fontFace: FONT, fontSize: 14,
          bold: true, color: C.ink, align: "left", valign: "middle", fit: "shrink", lineSpacingMultiple: 1.02,
        });
        return;
      }
      case "bulletList":
      case "numberedList": {
        const ordered = b.kind === "numberedList";
        const runs = b.items.map((it) => ({
          text: it,
          options: {
            bullet: ordered ? { type: "number" as const } : { code: "2022", indent: 18 },
            fontFace: FONT, fontSize: 14, color: C.ink, paraSpaceAfter: 6, lineSpacingMultiple: 1.02,
          },
        }));
        slide.addText(runs, { ...region, align: "left", valign: "top", fit: "shrink" });
        return;
      }
      case "flow": {
        const n = b.items.length;
        const gap = 0.16;
        const cw = (region.w - gap * (n - 1)) / n;
        const h = Math.min(region.h, 0.62);
        const y = region.y + (region.h - h) / 2;
        b.items.forEach((it, i) => {
          const x = region.x + i * (cw + gap);
          slide.addShape(S.roundRect, {
            x, y, w: cw, h, rectRadius: 0.1, fill: { color: C.green }, line: { type: "none" },
          });
          slide.addText(it, {
            x, y, w: cw, h, fontFace: FONT, fontSize: 13, bold: true, color: C.white,
            align: "center", valign: "middle", fit: "shrink",
          });
        });
        return;
      }
      case "pillars": {
        const cols = b.items.length === 4 ? 2 : b.items.length;
        cardGrid(slide, b.items, region, { cols });
        return;
      }
      case "principles": {
        let reg = region;
        if (b.title) {
          slide.addText(b.title, {
            x: region.x, y: region.y, w: region.w, h: 0.36, fontFace: FONT, fontSize: 14, bold: true,
            color: C.green, align: "left", valign: "top", fit: "shrink",
          });
          reg = { x: region.x, y: region.y + 0.46, w: region.w, h: region.h - 0.46 };
        }
        const items = b.items.map((it) => ({
          label: it.letter,
          title: it.label,
          description: it.points.join("\n"),
        }));
        const cols = items.length === 4 ? 4 : items.length;
        cardGrid(slide, items, reg, { cols, bigLetter: true });
        return;
      }
      case "steps": {
        const n = b.items.length;
        const gy = 0.16;
        const rh = (region.h - gy * (n - 1)) / n;
        b.items.forEach((s, i) => {
          const y = region.y + i * (rh + gy);
          slide.addShape(S.roundRect, {
            x: region.x, y, w: region.w, h: rh, rectRadius: 0.06,
            fill: { color: C.cardFill }, line: { color: C.cardLine, width: 1 },
          });
          const bs = Math.min(rh - 0.18, 0.7);
          slide.addShape(S.roundRect, {
            x: region.x + 0.12, y: y + (rh - bs) / 2, w: bs, h: bs, rectRadius: 0.1, fill: { color: C.green },
          });
          slide.addText(String(s.num), {
            x: region.x + 0.12, y: y + (rh - bs) / 2, w: bs, h: bs, fontFace: FONT, fontSize: 20, bold: true,
            color: C.white, align: "center", valign: "middle",
          });
          const tx = region.x + 0.12 + bs + 0.22;
          const tw = region.w - (0.12 + bs + 0.22) - 0.2;
          slide.addText(s.label, {
            x: tx, y: y + 0.1, w: tw, h: 0.36, fontFace: FONT, fontSize: 15, bold: true,
            color: C.green, align: "left", valign: "top", fit: "shrink",
          });
          slide.addText(s.detail, {
            x: tx, y: y + 0.44, w: tw, h: rh - 0.5, fontFace: FONT, fontSize: 12.5, color: C.ink,
            align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 1.0,
          });
        });
        return;
      }
      case "channels": {
        const cols = 2;
        const n = b.items.length;
        const rows = Math.ceil(n / cols);
        const gx = 0.22;
        const gy = 0.14;
        const cw = (region.w - gx * (cols - 1)) / cols;
        const ch = (region.h - gy * (rows - 1)) / rows;
        b.items.forEach((it, idx) => {
          const r = Math.floor(idx / cols);
          const c = idx % cols;
          const x = region.x + c * (cw + gx);
          const y = region.y + r * (ch + gy);
          slide.addShape(S.roundRect, {
            x, y, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.cardFill }, line: { color: C.cardLine, width: 1 },
          });
          slide.addShape(S.rect, { x, y, w: 0.07, h: ch, fill: { color: C.gold } });
          slide.addText(
            [
              { text: it.name + "  ", options: { bold: true, color: C.green, fontSize: 13 } },
              { text: "— " + it.purpose, options: { color: C.ink, fontSize: 12, italic: true } },
            ],
            { x: x + 0.2, y, w: cw - 0.34, h: ch, fontFace: FONT, align: "left", valign: "middle", fit: "shrink" },
          );
        });
        return;
      }
      case "publics": {
        const header = b.headers.map((h) => ({
          text: h,
          options: { fill: { color: C.green }, color: C.white, bold: true, align: "center" as const, valign: "middle" as const },
        }));
        const body = b.rows.map((row, ri) => {
          const cells = [row.public, row.verbs.join(" / "), ...row.columns];
          const fill = ri % 2 === 0 ? C.white : C.cream;
          return cells.map((txt, ci) => ({
            text: txt,
            options: {
              fill: { color: fill },
              color: ci === 0 ? C.green : C.ink,
              bold: ci === 0,
              italic: ci === 1,
              align: "left" as const,
              valign: "middle" as const,
            },
          }));
        });
        const cols = b.headers.length;
        const colW = cols === 5 ? [1.7, 2.2, 2.85, 2.7, 2.68] : Array(cols).fill(CONTENT_W / cols);
        slide.addTable([header, ...body], {
          x: region.x, y: region.y, w: region.w, h: region.h,
          colW, fontFace: FONT, fontSize: 10.5, border: { type: "solid", color: "D7DED8", pt: 1 },
          align: "left", valign: "middle", autoPage: false,
        });
        return;
      }
    }
  }

  /* -------- Couverture & clôture -------- */
  function addCoverSlide(slide: Slide, s: CommSlide) {
    slide.background = { color: C.greenDark };
    slide.addShape(S.rect, { x: 0, y: 0, w: PAGE_W, h: 0.16, fill: { color: C.gold } });
    slide.addShape(S.rect, { x: 0, y: PAGE_H - 0.16, w: PAGE_W, h: 0.16, fill: { color: C.green } });

    slide.addText("SÉMINAIRE SENEC", {
      x: MX, y: 0.7, w: CONTENT_W, h: 0.36, fontFace: FONT, fontSize: 13, bold: true,
      color: C.gold, charSpacing: 3, align: "left", valign: "middle",
    });
    slide.addText(s.title, {
      x: MX, y: 1.2, w: CONTENT_W, h: 2.2, fontFace: FONT, fontSize: 40, bold: true,
      color: C.white, align: "left", valign: "top", fit: "shrink", lineSpacingMultiple: 1.0,
    });
    slide.addShape(S.rect, { x: MX, y: 3.5, w: 2.4, h: 0.07, fill: { color: C.gold } });
    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: MX, y: 3.72, w: CONTENT_W, h: 0.6, fontFace: FONT, fontSize: 18, italic: true,
        color: "DCE7DF", align: "left", valign: "top", fit: "shrink",
      });
    }

    const pillarsBlock = s.blocks.find((b) => b.kind === "pillars");
    if (pillarsBlock && pillarsBlock.kind === "pillars") {
      const items = pillarsBlock.items;
      const n = items.length;
      const gap = 0.3;
      const y = 4.7;
      const h = 1.5;
      const cw = (CONTENT_W - gap * (n - 1)) / n;
      items.forEach((it, i) => {
        const x = MX + i * (cw + gap);
        slide.addShape(S.roundRect, {
          x, y, w: cw, h, rectRadius: 0.1, fill: { color: "16382A" }, line: { color: C.gold, width: 1 },
        });
        slide.addText(it.label, {
          x: x + 0.22, y: y + 0.16, w: cw - 0.44, h: 0.5, fontFace: FONT, fontSize: 24, bold: true, color: C.gold,
          align: "left", valign: "top", fit: "shrink",
        });
        slide.addText(it.title, {
          x: x + 0.22, y: y + 0.62, w: cw - 0.44, h: 0.5, fontFace: FONT, fontSize: 14, bold: true,
          color: C.white, align: "left", valign: "top", fit: "shrink",
        });
        slide.addText(it.description, {
          x: x + 0.22, y: y + 1.06, w: cw - 0.44, h: 0.38, fontFace: FONT, fontSize: 11, italic: true,
          color: "B9C8BE", align: "left", valign: "top", fit: "shrink",
        });
      });
    }

    const muted = s.blocks.find((b) => b.kind === "paragraph");
    if (muted && muted.kind === "paragraph") {
      slide.addText(muted.text, {
        x: MX, y: 6.5, w: CONTENT_W, h: 0.5, fontFace: FONT, fontSize: 11.5, color: "9FB2A6",
        align: "left", valign: "middle", fit: "shrink",
      });
    }
  }

  function addClosingSlide(slide: Slide, s: CommSlide) {
    slide.background = { color: C.greenDark };
    slide.addShape(S.rect, { x: 0, y: 0, w: PAGE_W, h: 0.16, fill: { color: C.gold } });

    slide.addText("DIAPOSITIVE DE CLÔTURE", {
      x: MX, y: 0.7, w: CONTENT_W, h: 0.34, fontFace: FONT, fontSize: 12, bold: true,
      color: C.gold, charSpacing: 3, align: "left", valign: "middle",
    });
    slide.addText(s.title, {
      x: MX, y: 1.12, w: CONTENT_W, h: 1.1, fontFace: FONT, fontSize: 44, bold: true,
      color: C.white, align: "left", valign: "top", fit: "shrink",
    });
    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: MX, y: 2.2, w: CONTENT_W, h: 0.5, fontFace: FONT, fontSize: 18, italic: true, color: "DCE7DF",
        align: "left", valign: "top", fit: "shrink",
      });
    }
    slide.addShape(S.rect, { x: MX, y: 2.78, w: 2.4, h: 0.06, fill: { color: C.gold } });

    const paras = s.blocks.filter(
      (b): b is Extract<CommSlideBlock, { kind: "paragraph" }> => b.kind === "paragraph",
    );
    let cy = 3.1;
    const highlight = s.blocks.find((b) => b.kind === "highlight");
    if (highlight && highlight.kind === "highlight") {
      slide.addText(highlight.text.toUpperCase(), {
        x: MX, y: cy, w: CONTENT_W, h: 0.34, fontFace: FONT, fontSize: 13, bold: true, color: C.gold,
        charSpacing: 1, align: "left", valign: "top", fit: "shrink",
      });
      cy += 0.44;
    }
    paras.forEach((p) => {
      slide.addText(p.text, {
        x: MX, y: cy, w: CONTENT_W, h: 0.8, fontFace: FONT, fontSize: p.tone === "lead" ? 17 : 14,
        bold: p.tone === "lead", color: p.tone === "lead" ? C.white : "CFDCD3", align: "left", valign: "top",
        fit: "shrink", lineSpacingMultiple: 1.05,
      });
      cy += 0.92;
    });

    const flow = s.blocks.find((b) => b.kind === "flow");
    if (flow && flow.kind === "flow") {
      const n = flow.items.length;
      const gap = 0.26;
      const y = 5.9;
      const h = 0.78;
      const cw = (CONTENT_W - gap * (n - 1)) / n;
      flow.items.forEach((it, i) => {
        const x = MX + i * (cw + gap);
        slide.addShape(S.roundRect, {
          x, y, w: cw, h, rectRadius: 0.1, fill: { color: "16382A" }, line: { color: C.gold, width: 1.25 },
        });
        slide.addText(it, {
          x, y, w: cw, h, fontFace: FONT, fontSize: 17, bold: true, color: C.white,
          align: "center", valign: "middle", fit: "shrink",
        });
      });
    }
  }

  /* -------- Assemblage -------- */
  for (const s of seminaire.slides) {
    const slide = pptx.addSlide();
    if (s.layout === "cover") {
      addCoverSlide(slide, s);
      continue;
    }
    if (s.layout === "closing") {
      addClosingSlide(slide, s);
      continue;
    }
    slide.background = { color: C.cream };
    const region = addHeader(slide, s);
    renderBlocks(slide, s.blocks, region);
    addFooter(slide, s);
  }

  await pptx.writeFile({ fileName: outAbsPath });
  console.log(`✓ ${seminaire.meta.slug} : ${TOTAL} diapositives → ${outAbsPath}`);
}

/* ===========================================================================
   Point d'entrée : génère les deux decks.
   ======================================================================== */
async function main() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.resolve(here, "..", "public", "seminaires");
  await generate(
    COMMUNICATION_PASTORALE,
    path.join(publicDir, "communication-pastorale", "support.pptx"),
  );
  await generate(
    IA_COMMUNICATION,
    path.join(publicDir, "ia-communication", "support.pptx"),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
