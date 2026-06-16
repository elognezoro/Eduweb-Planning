"use client";

import * as React from "react";
import { SearchCheck, Plus, CalendarClock, CheckCheck, Loader2, MoreHorizontal, FileText, Play } from "lucide-react";
import { toast } from "sonner";
import { ModulePage } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { SimpleTable } from "@/components/data-table/simple-table";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/components/app-shell/data-store";
import { ENSEIGNANTS } from "@/lib/mock-data";
import { toPrenomCase } from "@/lib/format-name";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@/lib/types";

export default function InspectionPage() {
  const { inspections, addInspection } = useStore();
  const [status, setStatus] = React.useState("all");
  const data = inspections.filter((i) => status === "all" || i.status === status);

  return (
    <ModulePage
      title="Inspection"
      description="Planifiez et suivez les inspections pédagogiques : inspecteurs, enseignants, grilles et scores."
      icon={SearchCheck}
      permission="inspection:view"
      actions={<PlanInspectionDialog onCreate={addInspection} />}
      kpis={[
        { label: "Inspections", value: inspections.length, icon: SearchCheck, tone: "green" },
        { label: "Planifiées", value: inspections.filter((i) => i.status === "planned").length, icon: CalendarClock, tone: "blue" },
        { label: "En cours", value: inspections.filter((i) => i.status === "in_progress").length, icon: Loader2, tone: "gold" },
        { label: "Terminées", value: inspections.filter((i) => i.status === "completed").length, icon: CheckCheck, tone: "purple" },
      ]}
    >
      <FilterBar>
        <FilterSelect
          value={status}
          onValueChange={setStatus}
          options={[
            { value: "all", label: "Tous les statuts" },
            { value: "planned", label: "Planifiée" },
            { value: "in_progress", label: "En cours" },
            { value: "completed", label: "Terminée" },
          ]}
        />
      </FilterBar>

      <SimpleTable<Inspection>
        rows={data}
        getKey={(r) => r.id}
        columns={[
          {
            key: "teacher",
            header: "Enseignant",
            render: (r) => (
              <div>
                <p className="font-semibold text-foreground">{r.teacher}</p>
                <p className="text-xs text-muted-foreground">{r.subject} · {r.className}</p>
              </div>
            ),
          },
          { key: "inspector", header: "Inspecteur" },
          { key: "etablissement", header: "Établissement" },
          { key: "plannedAt", header: "Date", render: (r) => formatDate(r.plannedAt) },
          { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "score",
            header: "Score",
            render: (r) => (r.globalScore ? <Badge tone="green">{r.globalScore}/20</Badge> : "—"),
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (r) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.info(`Démarrer l'inspection de ${r.teacher}`)}>
                    <Play className="h-4 w-4" /> Démarrer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Ouvrir le rapport")}>
                    <FileText className="h-4 w-4" /> Rapport
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />
    </ModulePage>
  );
}

function PlanInspectionDialog({ onCreate }: { onCreate: (i: Omit<Inspection, "id">) => void }) {
  const [open, setOpen] = React.useState(false);
  const [teacherId, setTeacherId] = React.useState(ENSEIGNANTS[0].id);
  const [inspector, setInspector] = React.useState("Inspecteur Konan");
  const [className, setClassName] = React.useState("3ᵉ A");
  const [date, setDate] = React.useState("");

  const teacher = ENSEIGNANTS.find((t) => t.id === teacherId) ?? ENSEIGNANTS[0];

  const submit = () => {
    if (!date) {
      toast.error("La date de l'inspection est requise");
      return;
    }
    onCreate({
      teacher: `${teacher.firstName} ${teacher.lastName}`,
      inspector,
      etablissement: "Lycée Moderne de Cocody",
      subject: teacher.specialty,
      className,
      plannedAt: new Date(`${date}T09:00:00`).toISOString(),
      status: "planned",
    });
    toast.success("Inspection planifiée", { description: `${teacher.firstName} ${teacher.lastName} — ${teacher.specialty}` });
    setDate("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Planifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Planifier une inspection</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Enseignant</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENSEIGNANTS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} — {t.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Inspecteur</Label>
              <Input value={inspector} onChange={(e) => setInspector(toPrenomCase(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Classe</Label>
              <Input value={className} onChange={(e) => setClassName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={submit}>Planifier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
