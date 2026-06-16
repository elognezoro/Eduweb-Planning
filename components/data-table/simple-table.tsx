import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/layout/states";
import { cn } from "@/lib/utils";

export interface SimpleColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

interface SimpleTableProps<T> {
  columns: SimpleColumn<T>[];
  rows: T[];
  getKey?: (row: T, index: number) => string;
  emptyTitle?: string;
}

/** Tableau simple (sans tri/pagination) pour afficher rapidement des listes. */
export function SimpleTable<T>({
  columns,
  rows,
  getKey,
  emptyTitle,
}: SimpleTableProps<T>) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle ?? "Aucun élément"} className="border-0" />;
  }
  const alignCls = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "");
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.key} className={cn(alignCls(c.align), c.className)}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={getKey ? getKey(row, i) : i}>
              {columns.map((c) => (
                <TableCell key={c.key} className={cn(alignCls(c.align), c.className)}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
