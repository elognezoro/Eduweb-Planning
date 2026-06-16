"use client";

import * as React from "react";
import { ImageIcon, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

/**
 * Zone de dépôt d'image (glisser-déposer ou clic) ; la valeur est un data-URL
 * persistable. Utilisé pour logos, cachets et signatures électroniques.
 */
export function ImageDrop({
  label,
  value,
  onChange,
  icon: Icon = ImageIcon,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  icon?: LucideIcon;
}) {
  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide">{label}</Label>
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-3 text-center transition-colors hover:border-ew-green-600 hover:bg-ew-green-50/40"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="max-h-20 max-w-full object-contain" />
        ) : (
          <>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] text-muted-foreground">Glissez une image ou cliquez</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
      {value && (
        <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold text-red-600 hover:underline">
          Retirer l&apos;image
        </button>
      )}
    </div>
  );
}
