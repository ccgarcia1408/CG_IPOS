import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import SearchableSelect from "../../components/form/SearchableSelect";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Product } from "../../types/Product";
import { InventoryLog } from "../../types/InventoryLog";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const transactionColor = (type: string): "success" | "error" | "warning" | "info" => {
  if (type === "RECEIVE") return "success";
  if (type === "DEDUCT") return "error";
  if (type === "ADJUST") return "warning";
  return "info";
};

export default function InventoryLogs() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branchId, setBranchId] = useState("");
  const [productId, setProductId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async (selectedBranchId = branchId, selectedProductId = productId) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBranchId) params.set("BranchId", selectedBranchId);
      if (selectedProductId) params.set("ProductId", selectedProductId);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get<{ data: InventoryLog[] }>(`/api/inventory/movements${suffix}`, { auth: true });
      setLogs(response.data ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load inventory logs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load("", "");
    api.get<{ data: Branch[] }>("/api/branches/active", { auth: true })
      .then((response) => setBranches(response.data ?? []))
      .catch(() => toast.error("Failed to load branches."));
    api.get<{ data: Product[] }>("/api/products/active", { auth: true })
      .then((response) => setProducts(response.data ?? []))
      .catch(() => toast.error("Failed to load products."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? logs.filter((log) =>
          [log.ProductName, log.Barcode, log.SKU, log.BranchName, log.TransactionType, log.ReferenceType, log.Remarks]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        )
      : logs;
  }, [logs, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = useMemo(() => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [rows, currentPage, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [search, branchId, productId]);

  return (
    <>
      <PageMeta title="CG_IPOS | Inventory Logs" description="Inventory movement history" />
      <PageBreadcrumb pageTitle="Inventory Logs" />
      <ComponentCard title="Inventory Movement History">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <SearchableSelect
            className="w-56"
            placeholder="All branches"
            value={branchId}
            onChange={(value) => { setBranchId(value); void load(value, productId); }}
            options={[{ value: "", label: "All branches" }, ...branches.map((branch) => ({ value: String(branch.BranchId), label: branch.Description || branch.Name }))]}
          />
          <SearchableSelect
            className="w-56"
            placeholder="All products"
            value={productId}
            onChange={(value) => { setProductId(value); void load(branchId, value); }}
            options={[{ value: "", label: "All products" }, ...products.map((product) => ({ value: String(product.ProductId), label: product.Name }))]}
          />
          <div className="relative">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs..."
              className="rounded-lg border px-3 py-2 pr-16 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? <p>Loading inventory logs...</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                <TableRow>
                  {["Date/Time", "Branch", "Product", "Type", "Reference", "Quantity", "Before", "After", "Remarks"].map((header) => (
                    <TableCell key={header} isHeader>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedRows.length ? paginatedRows.map((log) => (
                  <TableRow key={log.InventoryLogId}>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{new Date(log.CreatedAt).toLocaleString()}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{log.BranchName}</TableCell>
                    <TableCell className="px-5 py-4">
                      <p className="font-medium text-gray-800 dark:text-white">{log.ProductName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{log.Barcode || log.SKU || "—"}</p>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={transactionColor(log.TransactionType)}>{log.TransactionType}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{log.ReferenceType}{log.ReferenceId ? ` #${log.ReferenceId}` : ""}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{log.Quantity}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{log.StockBefore}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{log.StockAfter}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{log.Remarks || "-"}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">No inventory logs found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && (
          <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-white/[0.05] md:flex-row">
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing {rows.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, rows.length)} of {rows.length} entries</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:text-gray-400 dark:border-white/10 dark:text-gray-300">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === i + 1 ? "bg-brand-500 text-white" : "border dark:border-white/10 dark:text-gray-300"}`}>{i + 1}</button>)}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:text-gray-400 dark:border-white/10 dark:text-gray-300">Next</button>
            </div>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded-lg border px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300">
              <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
          </div>
        )}
      </ComponentCard>
    </>
  );
}
