"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/states";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 25, 50, 100] as const;

/** Liste compacte de numéros de page avec ellipses (1 … 4 5 [6] 7 8 … 20). */
function pageList(pageIndex: number, pageCount: number): (number | "ellipsis")[] {
  const cur = pageIndex + 1;
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, cur - 1);
  const end = Math.min(pageCount - 1, cur + 1);
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push("ellipsis");
  pages.push(pageCount);
  return pages;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchableColumn?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  /** Active la sélection de lignes (case à cocher d'en-tête + par ligne). */
  enableSelection?: boolean;
  /** Identifiant stable d'une ligne (requis pour une sélection fiable). */
  getRowId?: (row: TData) => string;
  /** Barre d'actions groupées rendue quand au moins une ligne est sélectionnée. */
  bulkActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode;
}

const checkboxCls =
  "h-4 w-4 cursor-pointer rounded border-input accent-ew-green-700 align-middle";

/** Tableau de données générique : recherche, tri, pagination, sélection (TanStack Table). */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Rechercher…",
  pageSize = 10,
  toolbar,
  enableSelection = false,
  getRowId,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const allColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!enableSelection) return columns;
    const selectColumn: ColumnDef<TData, TValue> = {
      id: "__select",
      enableSorting: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Tout sélectionner"
          className={checkboxCls}
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
          }}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label="Sélectionner la ligne"
          className={checkboxCls}
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    };
    return [selectColumn, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, globalFilter, rowSelection },
    enableRowSelection: enableSelection,
    getRowId,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {toolbar}
      </div>

      {enableSelection && selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ew-green-100 bg-ew-green-50 px-3 py-2">
          <span className="text-sm font-medium text-ew-green-800">
            {selectedRows.length} sélectionné{selectedRows.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {bulkActions?.(selectedRows, () => table.resetRowSelection())}
            <Button variant="ghost" size="sm" onClick={() => table.resetRowSelection()}>
              Tout désélectionner
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <TableHead key={header.id} className={cn(header.column.id === "__select" && "w-10")}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={allColumns.length} className="p-0">
                  <EmptyState className="border-0 bg-transparent" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getFilteredRowModel().rows.length > 0 &&
        (() => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageCount = table.getPageCount();
          const totalRows = table.getFilteredRowModel().rows.length;
          const size = table.getState().pagination.pageSize;
          const isAll = size >= 100000;
          const sizeOptions = isAll
            ? [...PAGE_SIZES]
            : [...new Set<number>([...PAGE_SIZES, size])].sort((a, b) => a - b);
          return (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              {/* Nombre d'éléments par page (avec « Tous ») */}
              <div className="flex items-center gap-2">
                <span>Afficher</span>
                <Select
                  value={isAll ? "all" : String(size)}
                  onValueChange={(v) => {
                    table.setPageIndex(0);
                    table.setPageSize(v === "all" ? 100000 : Number(v));
                  }}
                >
                  <SelectTrigger className="h-8 w-[88px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                    <SelectItem value="all">Tous</SelectItem>
                  </SelectContent>
                </Select>
                <span className="whitespace-nowrap">par page · {totalRows} élément(s)</span>
              </div>

              {/* Navigation libre entre les pages */}
              {pageCount > 1 && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} aria-label="Première page">
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Page précédente">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {pageList(pageIndex, pageCount).map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`e${i}`} className="px-1.5">
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={p - 1 === pageIndex ? "default" : "outline"}
                        size="icon"
                        className="h-8 min-w-8 px-2"
                        onClick={() => table.setPageIndex(p - 1)}
                        aria-current={p - 1 === pageIndex ? "page" : undefined}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Page suivante">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()} aria-label="Dernière page">
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
}
