"use client";

import * as React from "react";
import { BadgePercent, Check, X, Clock, Ticket, Copy, Building2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/layout/states";
import { useStore, type PromoRequest } from "@/components/app-shell/data-store";
import { useApp } from "@/components/app-shell/app-context";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<PromoRequest["status"], { label: string; tone: "gold" | "green" | "red" }> = {
  pending: { label: "En attente", tone: "gold" },
  approved: { label: "Approuvé", tone: "green" },
  rejected: { label: "Refusé", tone: "red" },
};

export default function ApprobationsPromoPage() {
  const { promoRequests, approvePromoRequest, rejectPromoRequest } = useStore();
  const { user: me } = useApp();
  const [rejecting, setRejecting] = React.useState<PromoRequest | null>(null);

  const pending = promoRequests.filter((r) => r.status === "pending");
  const approved = promoRequests.filter((r) => r.status === "approved");
  const rejected = promoRequests.filter((r) => r.status === "rejected");

  const approve = (r: PromoRequest) => {
    approvePromoRequest(r.id, me.displayName);
    toast.success("Demande approuvée", {
      description: `${r.requester} — code de réduction −${r.pct}% généré et notifié.`,
    });
  };

  const listFor = (status: "all" | PromoRequest["status"]) =>
    status === "all" ? promoRequests : promoRequests.filter((r) => r.status === status);

  const renderList = (list: PromoRequest[]) =>
    list.length === 0 ? (
      <EmptyState title="Aucune demande trouvée" description="Aucune demande de code promo dans cette catégorie." />
    ) : (
      <div className="space-y-4">
        {list.map((r) => (
          <RequestCard key={r.id} request={r} onApprove={() => approve(r)} onReject={() => setRejecting(r)} />
        ))}
      </div>
    );

  return (
    <ModulePage
      title="Approbations de codes promo"
      description="Validez ou refusez les demandes de codes promo de réduction (allocations IZEN, E-School, groupes d'établissements…)."
      icon={BadgePercent}
      permission="system:approve_promotions"
      kpis={[
        { label: "En attente", value: pending.length, icon: Clock, tone: "gold" },
        { label: "Approuvées", value: approved.length, icon: Check, tone: "green" },
        { label: "Refusées", value: rejected.length, icon: X, tone: "red" },
        { label: "Total demandes", value: promoRequests.length, icon: Ticket, tone: "blue" },
      ]}
    >
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="all">Tous ({promoRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">En attente ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approuvés ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Refusés ({rejected.length})</TabsTrigger>
        </TabsList>
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {renderList(listFor(tab))}
          </TabsContent>
        ))}
      </Tabs>

      {rejecting && (
        <RejectDialog
          request={rejecting}
          onCancel={() => setRejecting(null)}
          onConfirm={(reason) => {
            rejectPromoRequest(rejecting.id, me.displayName, reason);
            toast.warning("Demande refusée", { description: `${rejecting.requester} — le motif lui sera communiqué.` });
            setRejecting(null);
          }}
        />
      )}
    </ModulePage>
  );
}

/* ------------------------------- Carte de demande ------------------------------ */
function RequestCard({
  request: r,
  onApprove,
  onReject,
}: {
  request: PromoRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  const st = STATUS_LABELS[r.status];
  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-foreground">{r.requester}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{r.requesterRole}</span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {r.etablissement}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Demande du {formatDate(r.requestedAt)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="purple">
            <BadgePercent className="h-3 w-3" /> {r.type} · −{r.pct}%
          </Badge>
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-muted/60 p-3 text-sm text-foreground">{r.justification}</p>

      {r.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button onClick={onApprove}>
            <Check className="h-4 w-4" /> Approuver
          </Button>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onReject}>
            <X className="h-4 w-4" /> Refuser
          </Button>
        </div>
      )}

      {r.status === "approved" && r.code && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ew-green-600/30 bg-ew-green-50 p-3">
          <span className="flex items-center gap-2 text-sm text-ew-green-900">
            <Ticket className="h-4 w-4" /> Code généré :
            <code className="rounded bg-white px-2 py-0.5 font-mono text-sm font-bold text-ew-green-800 ring-1 ring-ew-green-600/30">
              {r.code}
            </code>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs text-ew-green-900/70">
              Approuvé par {r.decidedBy} le {r.decidedAt ? formatDate(r.decidedAt) : "—"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(r.code ?? "");
                toast.success("Code copié", { description: r.code });
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Copier
            </Button>
          </span>
        </div>
      )}

      {r.status === "rejected" && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
          <p className="font-semibold text-red-700">Motif du refus</p>
          <p className="text-red-700/90">{r.reason || "—"}</p>
          <p className="mt-1 text-xs text-red-700/60">
            Refusé par {r.decidedBy} le {r.decidedAt ? formatDate(r.decidedAt) : "—"}
          </p>
        </div>
      )}
    </SectionCard>
  );
}

/* -------------------------------- Refus motivé -------------------------------- */
function RejectDialog({
  request,
  onCancel,
  onConfirm,
}: {
  request: PromoRequest;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refuser la demande</DialogTitle>
          <DialogDescription>
            {request.requester} — {request.type} (−{request.pct}%). Le motif sera communiqué au demandeur.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>
            Motif du refus <span className="text-red-500">*</span>
          </Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex : pièce justificative manquante…" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="destructive" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>
            <X className="h-4 w-4" /> Refuser la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
