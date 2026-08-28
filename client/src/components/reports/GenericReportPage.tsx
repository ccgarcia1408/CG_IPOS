import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PageMeta from "../common/PageMeta";
import PageBreadcrumb from "../common/PageBreadCrumb";
import DashboardFilterBar, { DashboardFilters } from "../dashboard/DashboardFilterBar";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { api } from "../../services/api";
import { ReportColumn, exportReportToExcel, exportReportToPdf } from "../../utils/reportExport";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function buildReportUrl(path: string, filters: DashboardFilters, includeDateRange: boolean, extra: Record<string, string>) {
  const params = new URLSearchParams(extra);
  if (includeDateRange) {
    params.set("StartDate", filters.StartDate);
    params.set("EndDate", filters.EndDate);
  }
  if (filters.BranchId) params.set("BranchId", filters.BranchId);

  const query = params.toString();
  return `/api/dashboard/${path}${query ? `?${query}` : ""}`;
}

interface GenericReportPageProps<T> {
  title: string;
  description: string;
  breadcrumb: string;
  endpoint: string;
  columns: ReportColumn<T>[];
  rowKey: (row: T, index: number) => string | number;
  /** "list" renders a normal data table; "summary" renders a single object as stat cards. */
  kind?: "list" | "summary";
  /** Most dashboard endpoints need StartDate/EndDate; a few (alerts, status) are point-in-time only. */
  includeDateRange?: boolean;
  /** Extra fixed query params sent on every request (e.g. { Limit: "1000" }). */
  extraParams?: Record<string, string>;
  /** Optional control rendered next to the filter bar (e.g. a SortBy/Granularity dropdown). */
  extraControl?: (filters: DashboardFilters, reload: () => void) => ReactNode;
  emptyMessage?: string;
}

export default function GenericReportPage<T extends object>({
  title,
  description,
  breadcrumb,
  endpoint,
  columns,
  rowKey,
  kind = "list",
  includeDateRange = true,
  extraParams = {},
  extraControl,
  emptyMessage = "No data found for the selected filters.",
}: GenericReportPageProps<T>) {
  const [filters, setFilters] = useState<DashboardFilters | null>(null);
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (current: DashboardFilters) => {
      try {
        setLoading(true);
        const response = await api.get<{ data: T | T[] | null }>(
          buildReportUrl(endpoint, current, includeDateRange, extraParams),
          { auth: true }
        );
        const data = response.data;
        if (data === null || data === undefined) {
          setRows([]);
        } else if (Array.isArray(data)) {
          setRows(data);
        } else {
          setRows([data]);
        }
      } catch (error: unknown) {
        toast.error(errorMessage(error, `Failed to load ${title.toLowerCase()}.`));
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    // extraParams is an object literal from the caller; comparing its serialized form keeps this
    // stable across renders instead of refetching on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, includeDateRange, JSON.stringify(extraParams), title]
  );

  useEffect(() => {
    if (!filters) return;
    void load(filters);
  }, [filters, load]);

  const reload = useCallback(() => {
    if (filters) void load(filters);
  }, [filters, load]);

  const filterLabel = useMemo(() => {
    if (!filters) return "";
    const from = filters.StartDate.slice(0, 10);
    const to = filters.EndDate.slice(0, 10);
    return includeDateRange ? `${from} to ${to}` : "Current snapshot";
  }, [filters, includeDateRange]);

  const filenameBase = breadcrumb.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleExportExcel = () => {
    if (!rows.length) {
      toast.error("Nothing to export yet.");
      return;
    }
    void exportReportToExcel(columns, rows, filenameBase, breadcrumb);
  };

  const handleExportPdf = () => {
    if (!rows.length) {
      toast.error("Nothing to export yet.");
      return;
    }
    exportReportToPdf(columns, rows, filenameBase, title, filterLabel);
  };

  return (
    <>
      <PageMeta title={`CG_IPOS | ${title}`} description={description} />
      <PageBreadcrumb pageTitle={breadcrumb} />
      <div className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>

        <DashboardFilterBar onChange={setFilters} />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center gap-3">
            {extraControl && filters ? extraControl(filters, reload) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Download Excel
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
            Loading {title.toLowerCase()}...
          </div>
        ) : kind === "summary" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rows[0] &&
              columns.map((column) => (
                <div
                  key={column.key}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">{column.header}</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                    {column.format ? column.format(rows[0]) : String(rows[0][column.key as keyof T] ?? "-")}
                  </h3>
                </div>
              ))}
            {!rows[0] && (
              <div className="col-span-full rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
                {emptyMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        isHeader
                        className={column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : undefined}
                      >
                        {column.header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {rows.length ? (
                    rows.map((row, index) => (
                      <TableRow key={rowKey(row, index)} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={`whitespace-nowrap px-5 py-3 text-sm ${
                              column.bold ? "font-semibold text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-400"
                            } ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}`}
                          >
                            {column.format ? column.format(row) : String(row[column.key as keyof T] ?? "-")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {rows.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
                {rows.length} {rows.length === 1 ? "record" : "records"}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
