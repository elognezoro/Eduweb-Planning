"use client";

import * as React from "react";
import { Camera, Trash2, ZoomIn, Move, Check, Crop } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PHOTO_ACCEPTED,
  PHOTO_MIN_DIM,
  PHOTO_OUTPUT_SIZE,
  PHOTO_QUALITY,
  saveProfilePhoto,
  useProfilePhoto,
} from "@/lib/profile-photo";

const VIEWPORT = 280; // côté (px) de la fenêtre de cadrage à l'écran

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Rogne l'image au carré et la compresse (512×512 JPEG).
 * `offset` est exprimé en pixels de la fenêtre de cadrage (VIEWPORT) ; zoom 1 +
 * offset 0 = rognage centré automatique (l'image couvre toute la zone).
 */
function cropCompress(img: HTMLImageElement, offsetX = 0, offsetY = 0, zoom = 1): string {
  const C = PHOTO_OUTPUT_SIZE;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const k = C / VIEWPORT;
  const scale = (C / Math.min(w, h)) * zoom;
  const canvas = document.createElement("canvas");
  canvas.width = C;
  canvas.height = C;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, C, C);
  ctx.translate(C / 2 + offsetX * k, C / 2 + offsetY * k);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -w / 2, -h / 2);
  return canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
}

const dataUrlKb = (dataUrl: string) => Math.max(1, Math.round((dataUrl.length * 3) / 4 / 1024));

/**
 * Dépôt de photo de profil :
 *  - type JPG/PNG et dimensions ≥ 200×200 px exigés ;
 *  - quelle que soit la taille d'origine, la photo est rognée au carré (centré)
 *    et compressée automatiquement (512×512 JPEG) dès le dépôt ;
 *  - le cadrage reste ajustable ensuite (zoom + déplacement).
 */
export function ProfilePhotoUploader({ initials }: { initials: string }) {
  const photo = useProfilePhoto();
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Original conservé en mémoire de session pour ajuster le cadrage sans perte.
  const [original, setOriginal] = React.useState<{ src: string; img: HTMLImageElement } | null>(null);
  const [cropOpen, setCropOpen] = React.useState(false);

  const onFile = async (file: File) => {
    if (!PHOTO_ACCEPTED.includes(file.type)) {
      toast.error("Format non accepté", { description: "Déposez une image JPG ou PNG." });
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      const image = await loadImage(dataUrl);
      if (image.naturalWidth < PHOTO_MIN_DIM || image.naturalHeight < PHOTO_MIN_DIM) {
        toast.error("Image trop petite", {
          description: `${image.naturalWidth}×${image.naturalHeight} px — minimum ${PHOTO_MIN_DIM}×${PHOTO_MIN_DIM} px.`,
        });
        return;
      }
      // Rognage carré centré + compression automatiques, quelle que soit la taille d'origine.
      const cropped = cropCompress(image);
      saveProfilePhoto(cropped);
      setOriginal({ src: dataUrl, img: image });
      toast.success("Photo recadrée et compressée automatiquement", {
        description: `${(file.size / 1024 / 1024).toFixed(1)} Mo → ${dataUrlKb(cropped)} Ko (512×512). Ajustez le cadrage si besoin.`,
      });
    } catch {
      toast.error("Image illisible", { description: "Le fichier semble corrompu." });
    }
  };

  // Ajustement : repart de l'original (session) ; sinon de la photo enregistrée.
  const openAdjust = async () => {
    if (original) {
      setCropOpen(true);
      return;
    }
    if (!photo) return;
    try {
      const img = await loadImage(photo);
      setOriginal({ src: photo, img });
      setCropOpen(true);
    } catch {
      toast.error("Impossible de charger la photo");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar className="h-20 w-20">
        {photo && <AvatarImage src={photo} alt="Photo de profil" />}
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Camera className="h-4 w-4" /> {photo ? "Changer la photo" : "Déposer une photo"}
          </Button>
          {photo && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={openAdjust}>
                <Crop className="h-4 w-4" /> Ajuster le cadrage
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  saveProfilePhoto(null);
                  setOriginal(null);
                  toast.success("Photo retirée");
                }}
              >
                <Trash2 className="h-4 w-4" /> Retirer
              </Button>
            </>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          JPG ou PNG · minimum {PHOTO_MIN_DIM}×{PHOTO_MIN_DIM} px · toute taille acceptée — rognage carré et compression
          automatiques (512×512).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {cropOpen && original && (
        <CropDialog
          src={original.src}
          img={original.img}
          onCancel={() => setCropOpen(false)}
          onSave={(dataUrl) => {
            saveProfilePhoto(dataUrl);
            setCropOpen(false);
            toast.success("Cadrage mis à jour", { description: `${dataUrlKb(dataUrl)} Ko (512×512).` });
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------ Fenêtre de cadrage ------------------------------ */
function CropDialog({
  src,
  img,
  onCancel,
  onSave,
}: {
  src: string;
  img: HTMLImageElement;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const w = img.naturalWidth;
  const h = img.naturalHeight;
  // Échelle de base : l'image couvre toujours entièrement la fenêtre (pas de bords vides).
  const baseScale = VIEWPORT / Math.min(w, h);
  const scale = baseScale * zoom;

  const clamp = React.useCallback(
    (o: { x: number; y: number }, s: number) => ({
      x: Math.max(-(w * s - VIEWPORT) / 2, Math.min((w * s - VIEWPORT) / 2, o.x)),
      y: Math.max(-(h * s - VIEWPORT) / 2, Math.min((h * s - VIEWPORT) / 2, o.y)),
    }),
    [w, h],
  );

  const setZoomClamped = (z: number) => {
    setZoom(z);
    setOffset((o) => clamp(o, baseScale * z));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuster le cadrage</DialogTitle>
          <DialogDescription>
            Le rognage carré et la compression sont automatiques — déplacez l&apos;image et ajustez le zoom pour affiner ;
            la zone circulaire correspond à l&apos;avatar affiché.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <div
            className="relative cursor-grab touch-none overflow-hidden rounded-xl border border-border bg-muted active:cursor-grabbing"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              setOffset(
                clamp(
                  { x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) },
                  scale,
                ),
              );
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerLeave={() => (drag.current = null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: w * scale,
                height: h * scale,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
            {/* Masque circulaire : aperçu du cadrage avatar */}
            <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)", borderRadius: "50%" }} />
            <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/80" />
          </div>

          <div className="flex w-full items-center gap-3 px-1">
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoomClamped(Number(e.target.value))}
              className="w-full accent-ew-green-700"
              aria-label="Zoom"
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Move className="h-3.5 w-3.5" /> Glissez l&apos;image pour la repositionner.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={() => onSave(cropCompress(img, offset.x, offset.y, zoom))}>
            <Check className="h-4 w-4" /> Enregistrer le cadrage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
