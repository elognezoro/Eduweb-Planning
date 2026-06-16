import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide transition-colors",
  {
    variants: {
      tone: {
        green: "bg-ew-green-100 text-ew-green-800",
        gold: "bg-ew-gold-100 text-ew-gold-600",
        blue: "bg-blue-50 text-blue-700",
        purple: "bg-purple-50 text-purple-700",
        red: "bg-red-50 text-red-700",
        teal: "bg-cyan-50 text-cyan-700",
        slate: "bg-slate-100 text-slate-700",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { tone: "green" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
