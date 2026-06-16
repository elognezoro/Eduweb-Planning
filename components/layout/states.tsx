"use client";

import Link from "next/link";
import { Inbox, AlertTriangle, ShieldOff, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* -------------------------- EmptyState -------------------------- */
interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const t = useTranslations();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-ew-green-50/40 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ew-green-100 text-ew-green-700">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title ?? t("states.emptyTitle")}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description ?? t("states.emptyDescription")}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* -------------------------- ErrorState -------------------------- */
export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title ?? t("states.errorTitle")}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description ?? t("states.errorDescription")}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          {t("states.retry")}
        </Button>
      )}
    </div>
  );
}

/* ------------------------ ForbiddenState ------------------------ */
export function ForbiddenState() {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ew-gold-100 text-ew-gold-600">
        <ShieldOff className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{t("states.forbiddenTitle")}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{t("states.forbiddenDescription")}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">{t("states.backHome")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/systeme/habilitations">{t("states.requestAccess")}</Link>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------ LoadingSkeleton ----------------------- */
export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
