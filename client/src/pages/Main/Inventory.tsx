import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/modal/Modal";
import SearchableSelect from "../../components/form/SearchableSelect";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Product } from "../../types/Product";
import { Inventory as InventoryRecord } from "../../types/Inventory";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branchId, setBranchId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ BranchId: "", ProductId: "", Quantity: "", Remarks: "" });

  const [adjusting, setAdjusting] = useState<InventoryRecord | null>(null);
  const [adjustForm, setAdjustForm] = useState({ NewQuantity: "", Reason: "" });

  const load = async (selectedBranchId = branchId) => {
    try {
      setLoading(true);
      const suffix = selectedBranchId ? `?BranchId=${encodeURIComponent(selectedBranchId)}` : "";
      const response = await api.get<{ data: InventoryRecord[] }>(`/api/inventory${suffix}`, { auth: true });
      setInventory(response.data ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load inventory."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load("");
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
      ? inventory.filter((item) =>
          [item.ProductName, item.Barcode, item.SKU, item.BranchName].filter(Boolean).some((value) => String(value).toLowerCase().includes(term))
        )
      : inventory;
  }, [inventory, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = useMemo(() => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [rows, currentPage, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [search, branchId]);

  const resetReceiveForm = () => setReceiveForm({ BranchId: "", ProductId: "", Quantity: "", Remarks: "" });

  const submitReceive = async () => {
    if (!receiveForm.BranchId || !receiveForm.ProductId) return toast.error("Branch and product are required.");
    const quantity = Number(receiveForm.Quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) return toast.error("Quantity must be a positive whole number.");

    try {
      setSaving(true);
      await api.post(
        "/api/inventory/receive",
        {
          BranchId: Number(receiveForm.BranchId),
          ProductId: Number(receiveForm.ProductId),
          Quantity: quantity,
          Remarks: receiveForm.Remarks.trim() || null,
        },
        { auth: true }
      );
      toast.success("Stock received successfully.");
      setIsReceiveOpen(false);
      resetReceiveForm();
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to receive stock."));
    } finally {
      setSaving(false);
    }
  };

  const openAdjust = (item: InventoryRecord) => {
    setAdjusting(item);
    setAdjustForm({ NewQuantity: String(item.Quantity), Reason: "" });
  };

  const submitAdjust = async () => {
    if (!adjusting) return;
    const newQuantity = Number(adjustForm.NewQuantity);
    if (!Number.isInteger(newQuantity) || newQuantity < 0) return toast.error("New quantity must be a non-negative whole number.");
    if (!adjustForm.Reason.trim()) return toast.error("A reason is required for a stock adjustment.");

    try {
      setSaving(true);
      await api.post(
        "/api/inventory/adjust",
        {
          BranchId: adjusting.BranchId,
          ProductId: adjusting.ProductId,
          NewQuantity: newQuantity,
          Reason: adjustForm.Reason.trim(),
        },
        { auth: true }
      );
      toast.success("Stock adjusted successfully.");
      setAdjusting(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to adjust stock."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="CG_IPOS | Inventory" description="Branch inventory" />
      <PageBreadcrumb pageTitle="Inventory" />
      <ComponentCard title="Inventory by Branch">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <SearchableSelect
              className="w-56"
              placeholder="All branches"
              value={branchId}
              onChange={(value) => { setBranchId(value); void load(value); }}
              options={[{ value: "", label: "All branches" }, ...branches.map((branch) => ({ value: String(branch.BranchId), label: branch.Description || branch.Name }))]}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="rounded-lg border px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <button
            onClick={() => setIsReceiveOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            + Receive Stock
          </button>
        </div>

        {loading ? <p>Loading inventory...</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                <TableRow>
                  {["Branch", "Product", "Quantity", "Minimum", "Status", "Actions"].map((header) => (
                    <TableCell key={header} isHeader>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedRows.length ? paginatedRows.map((item) => (
                  <TableRow key={item.InventoryId}>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{item.BranchDescription || item.BranchName}</TableCell>
                    <TableCell className="px-5 py-4">
                      <p className="font-medium text-gray-800 dark:text-white">{item.ProductName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.Barcode || item.SKU || "—"}</p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{item.Quantity}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{item.MinimumStock}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={item.Quantity <= item.MinimumStock ? "warning" : "success"}>
                        {item.Quantity <= item.MinimumStock ? "Low stock" : "In stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <button onClick={() => openAdjust(item)} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                        Adjust
                      </button>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No inventory found.</TableCell></TableRow>}
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

      <Modal
        isOpen={isReceiveOpen}
        title="Receive Stock"
        onClose={() => { setIsReceiveOpen(false); resetReceiveForm(); }}
        onConfirm={submitReceive}
        confirmText="Receive"
        loading={saving}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Branch</label>
            <SearchableSelect
              placeholder="Select a branch..."
              value={receiveForm.BranchId}
              onChange={(v) => setReceiveForm((current) => ({ ...current, BranchId: v }))}
              options={branches.map((branch) => ({ value: String(branch.BranchId), label: branch.Description || branch.Name }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Product</label>
            <SearchableSelect
              placeholder="Select a product..."
              value={receiveForm.ProductId}
              onChange={(v) => setReceiveForm((current) => ({ ...current, ProductId: v }))}
              options={products.map((product) => ({ value: String(product.ProductId), label: product.Name }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Quantity</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={receiveForm.Quantity}
              onChange={(event) => setReceiveForm((current) => ({ ...current, Quantity: event.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Remarks (optional)</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={receiveForm.Remarks}
              onChange={(event) => setReceiveForm((current) => ({ ...current, Remarks: event.target.value }))}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!adjusting}
        title="Adjust Stock"
        onClose={() => setAdjusting(null)}
        onConfirm={submitAdjust}
        confirmText="Save Adjustment"
        loading={saving}
      >
        {adjusting && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <p className="font-semibold">{adjusting.ProductName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{adjusting.BranchDescription || adjusting.BranchName} · Current quantity: {adjusting.Quantity}</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">New Quantity (physical count)</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                value={adjustForm.NewQuantity}
                onChange={(event) => setAdjustForm((current) => ({ ...current, NewQuantity: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Reason</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                value={adjustForm.Reason}
                onChange={(event) => setAdjustForm((current) => ({ ...current, Reason: event.target.value }))}
                placeholder="e.g. Physical stocktake correction, damaged goods write-off..."
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
