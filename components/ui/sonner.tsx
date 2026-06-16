"use client";
import { Toaster as Sonner } from "sonner";

/** Toaster global EduWeb Planner (notifications). */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-border bg-card text-foreground shadow-lg",
          title: "font-semibold",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
