"use client";
import { Download, FileText, FileType } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadReportPdf, downloadReportWord, type ReportPayload } from "@/lib/exports";
import { etabExportMeta } from "@/lib/etab-config";

interface ExportMenuProps {
  buildPayload: () => ReportPayload;
  filename?: string;
  size?: "default" | "sm";
}

/** Menu d'export PDF / Word, génère le document côté client. */
export function ExportMenu({ buildPayload, filename = "rapport", size = "sm" }: ExportMenuProps) {
  const withEmblem = (): ReportPayload => ({ emblem: etabExportMeta().nationalEmblem, ...buildPayload() });
  const handlePdf = async () => {
    try {
      await downloadReportPdf(withEmblem(), `${filename}.pdf`);
      toast.success("Le rapport PDF est prêt", { description: "Le téléchargement a démarré." });
    } catch {
      toast.error("Export impossible", { description: "Une erreur est survenue lors de la génération." });
    }
  };
  const handleWord = async () => {
    try {
      await downloadReportWord(withEmblem(), `${filename}.docx`);
      toast.success("Le rapport Word est prêt", { description: "Le téléchargement a démarré." });
    } catch {
      toast.error("Export impossible", { description: "Une erreur est survenue lors de la génération." });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}>
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Format d&apos;export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePdf}>
          <FileText className="h-4 w-4" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWord}>
          <FileType className="h-4 w-4" />
          Exporter en Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
