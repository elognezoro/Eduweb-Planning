"use client";

import * as React from "react";
import { UserSquare, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================================
   Upload d'une PHOTO D'IDENTITÉ avec cadrage et taille IMPOSÉS.

   Toute image chargée est automatiquement :
   - recadrée au format photo d'identité 3:4 (portrait), recadrage CENTRÉ ;
   - redimensionnée à une taille fixe (360 × 480 px) ;
   - ré-encodée en JPEG (qualité 0,85) → data-URL léger et persistable.

   L'utilisateur n'a donc ni à recadrer ni à redimensionner : le cadrage et la
   taille sont garantis, conformes au modèle de livret.
   ========================================================================== */

const OUT_W = 360;
const OUT_H = 480; // ratio 3:4
const QUALITY = 0.85;

/** Recadre (centré) + redimensionne un fichier image en data-URL 3:4 360×480. */
function normalizeToIdPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible."));
      img.onload = () => {
        const targetRatio = OUT_W / OUT_H;
        const srcRatio = img.width / img.height;
        let sw = img.width;
        let sh = img.height;
        let sx = 0;
        let sy = 0;
        if (srcRatio > targetRatio) {
          // Source trop large → on rogne la largeur (centré).
          sw = Math.round(img.height * targetRatio);
          sx = Math.round((img.width - sw) / 2);
        } else {
          // Source trop haute → on rogne la hauteur (centré).
          sh = Math.round(img.width / targetRatio);
          sy = Math.round((img.height - sh) / 2);
        }
        const canvas = document.createElement("canvas");
        canvas.width = OUT_W;
        canvas.height = OUT_H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible."));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, OUT_W, OUT_H);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function IdentityPhotoUpload({
  value,
  onChange,
  disabled,
  label = "Photo d'identité",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
  label?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Veuillez choisir un fichier image.");
      return;
    }
    setBusy(true);
    try {
      onChange(await normalizeToIdPhoto(file));
    } catch {
      setError("Traitement de l'image impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      {/* Cadre 3:4 imposé */}
      <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md border border-gray-300 bg-muted/30">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-[9px] text-muted-foreground">
            <UserSquare className="h-6 w-6" />
            <span>Photo 3:4</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <p className="text-[10px] text-muted-foreground">Cadrage et taille imposés (3:4, 360×480 px).</p>
        {!disabled ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-semibold hover:bg-muted/30",
                busy && "opacity-60",
              )}
            >
              <Upload className="h-3.5 w-3.5" /> {busy ? "Traitement…" : value ? "Remplacer" : "Charger"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs text-destructive hover:bg-destructive/5"
              >
                <X className="h-3.5 w-3.5" /> Retirer
              </button>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
          </div>
        ) : (
          <span className="text-[10px] italic text-muted-foreground">Lecture seule</span>
        )}
        {error ? <span className="text-[10px] text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
