import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/modal/Modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import SearchableSelect from "../../components/form/SearchableSelect";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Supplier } from "../../types/Supplier";
import { Product } from "../../types/Product";
import { Purchase } from "../../types/Purchase";

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
const money = (value: number | string) => `₱${Number(value).toFixed(2)}`;
const todayDate = () => new Date().toISOString().slice(0, 10);

const statusColor: Record<string, "success" | "warning" | "error"> = {
  pending: "warning",
  received: "success",
  cancelled: "error",
};

type DraftItem = { ProductId: string; Quantity: string; CostPrice: string };
const emptyDraftItem: DraftItem = { ProductId: "", Quantity: "", CostPrice: "" };

export default function Purchasing() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [header, setHeader] = useState({ BranchId: "", SupplierId: "", PurchaseDate: todayDate() });
  const [items, setItems] = useState<DraftItem[]>([{ ...emptyDraftItem }]);

  const [viewing, setViewing] = useState<Purchase | null>(null);
  const [cancelling, setCancelling] = useState<Purchase | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [receiving, setReceiving] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Purchase[] }>("/api/purchases", { auth: true });
      setPurchases(response.data ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load purchase orders."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    api.get<{ data: Branch[] }>("/api/branches/active", { auth: true }).then((r) => setBranches(r.data ?? [])).catch(() => toast.error("Failed to load branches."));
    api.get<{ data: Supplier[] }>("/api/suppliers/active", { auth: true }).then((r) => setSuppliers(r.data ?? [])).catch(() => toast.error("Failed to load suppliers."));
    api.get<{ data: Product[] }>("/api/products/active", { auth: true }).then((r) => setProducts(r.data ?? [])).catch(() => toast.error("Failed to load products."));
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return purchases
      .filter((p) => !statusFilter || p.Status === statusFilter)
      .filter((p) => !term || [p.SupplierName, p.BranchDescription, p.BranchName, String(p.PurchaseId)].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)));
  }, [purchases, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = useMemo(() => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [rows, currentPage, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const resetCreateForm = () => {
    setHeader({ BranchId: "", SupplierId: "", PurchaseDate: todayDate() });
    setItems([{ ...emptyDraftItem }]);
  };

  const draftTotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.Quantity) || 0) * (Number(item.CostPrice) || 0), 0),
    [items]
  );

  const submitCreate = async () => {
    if (!header.BranchId || !header.SupplierId) return toast.error("Branch and supplier are required.");

    const cleanItems = items.filter((item) => item.ProductId);
    if (!cleanItems.length) return toast.error("At least one line item is required.");

    for (const item of cleanItems) {
      const quantity = Number(item.Quantity);
      const costPrice = Number(item.CostPrice);
      if (!Number.isInteger(quantity) || quantity <= 0) return toast.error("Each line item needs a positive whole quantity.");
      if (!Number.isFinite(costPrice) || costPrice < 0) return toast.error("Each line item needs a non-negative cost price.");
    }

    try {
      setSaving(true);
      await api.post(
        "/api/purchases",
        {
          BranchId: Number(header.BranchId),
          SupplierId: Number(header.SupplierId),
          PurchaseDate: header.PurchaseDate,
          Items: cleanItems.map((item) => ({ ProductId: Number(item.ProductId), Quantity: Number(item.Quantity), CostPrice: Number(item.CostPrice) })),
        },
        { auth: true }
      );
      toast.success("Purchase order created successfully.");
      setIsCreateOpen(false);
      resetCreateForm();
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create purchase order."));
    } finally {
      setSaving(false);
    }
  };

  const openView = async (purchase: Purchase) => {
    try {
      const response = await api.get<{ data: Purchase }>(`/api/purchases/${purchase.PurchaseId}`, { auth: true });
      setViewing(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load purchase order details."));
    }
  };

  const removeViewingItem = async (purchaseItemId: number) => {
    if (!viewing) return;
    try {
      await api.delete(`/api/purchases/items/${purchaseItemId}`, { auth: true });
      toast.success("Item removed.");
      const response = await api.get<{ data: Purchase }>(`/api/purchases/${viewing.PurchaseId}`, { auth: true });
      setViewing(response.data);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove item."));
    }
  };

  const confirmReceive = async () => {
    if (!receiving) return;
    try {
      setSaving(true);
      await api.post(`/api/purchases/${receiving.PurchaseId}/receive`, undefined, { auth: true });
      toast.success("Purchase order received — stock updated.");
      setReceiving(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to receive purchase order."));
    } finally {
      setSaving(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelling) return;
    if (!cancelReason.trim()) return toast.error("A reason is required to cancel a purchase order.");
    try {
      setSaving(true);
      await api.post(`/api/purchases/${cancelling.PurchaseId}/cancel`, { Reason: cancelReason.trim() }, { auth: true });
      toast.success("Purchase order cancelled.");
      setCancelling(null);
      setCancelReason("");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to cancel purchase order."));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      setSaving(true);
      await api.delete(`/api/purchases/${deleting.PurchaseId}`, { auth: true });
      toast.success("Purchase order deleted.");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete purchase order."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="CG_IPOS | Purchasing" description="Purchase orders and receiving" />
      <PageBreadcrumb pageTitle="Purchasing" />
      <ComponentCard title="Purchase Orders">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by supplier, branch, or #..."
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
            <SearchableSelect
              className="w-44"
              placeholder="All statuses"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "received", label: "Received" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            + New Purchase Order
          </button>
        </div>

        {loading ? <p>Loading purchase orders...</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                <TableRow>
                  {["#", "Branch", "Supplier", "Date", "Items", "Total", "Status", "Actions"].map((h) => <TableCell key={h} isHeader>{h}</TableCell>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedRows.length ? paginatedRows.map((purchase) => (
                  <TableRow key={purchase.PurchaseId}>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">#{purchase.PurchaseId}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{purchase.BranchDescription || purchase.BranchName}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{purchase.SupplierName}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{purchase.PurchaseDate?.slice(0, 10)}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{purchase.ItemCount ?? "-"}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{money(purchase.TotalAmount)}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={statusColor[purchase.Status]}>{purchase.Status[0].toUpperCase() + purchase.Status.slice(1)}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openView(purchase)} className="rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600">View</button>
                        {purchase.Status === "pending" && (
                          <>
                            <button onClick={() => setReceiving(purchase)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">Receive</button>
                            <button onClick={() => setCancelling(purchase)} className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600">Cancel</button>
                            <button onClick={() => setDeleting(purchase)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Delete</button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">No purchase orders found.</TableCell></TableRow>}
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

      {/* CREATE PURCHASE ORDER */}
      <Modal
        isOpen={isCreateOpen}
        title="New Purchase Order"
        onClose={() => { setIsCreateOpen(false); resetCreateForm(); }}
        onConfirm={submitCreate}
        confirmText="Create Purchase Order"
        loading={saving}
        width="xl"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Branch</label>
              <SearchableSelect
                placeholder="Select a branch..."
                value={header.BranchId}
                onChange={(v) => setHeader((c) => ({ ...c, BranchId: v }))}
                options={branches.map((b) => ({ value: String(b.BranchId), label: b.Description || b.Name }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Supplier</label>
              <SearchableSelect
                placeholder="Select a supplier..."
                value={header.SupplierId}
                onChange={(v) => setHeader((c) => ({ ...c, SupplierId: v }))}
                options={suppliers.map((s) => ({ value: String(s.SupplierId), label: s.SupplierName }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Purchase Date</label>
              <input type="date" className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={header.PurchaseDate} onChange={(e) => setHeader((c) => ({ ...c, PurchaseDate: e.target.value }))} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium">Line Items</label>
              <button type="button" onClick={() => setItems((current) => [...current, { ...emptyDraftItem }])} className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add Line</button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border p-3 dark:border-white/10 md:grid-cols-[2fr_1fr_1fr_auto]">
                  <SearchableSelect
                    placeholder="Select a product..."
                    value={item.ProductId}
                    onChange={(v) => setItems((current) => current.map((row, i) => i === index ? { ...row, ProductId: v } : row))}
                    options={products.map((p) => ({ value: String(p.ProductId), label: p.Name }))}
                  />
                  <input
                    type="number" min={1} placeholder="Quantity"
                    className="rounded-lg border px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    value={item.Quantity}
                    onChange={(e) => setItems((current) => current.map((row, i) => i === index ? { ...row, Quantity: e.target.value } : row))}
                  />
                  <input
                    type="number" min={0} step="0.01" placeholder="Cost Price"
                    className="rounded-lg border px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    value={item.CostPrice}
                    onChange={(e) => setItems((current) => current.map((row, i) => i === index ? { ...row, CostPrice: e.target.value } : row))}
                  />
                  <button
                    type="button"
                    onClick={() => setItems((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-3 text-right text-sm font-semibold">Total: {money(draftTotal)}</p>
          </div>
        </div>
      </Modal>

      {/* VIEW DETAILS */}
      <Modal isOpen={!!viewing} title={`Purchase Order #${viewing?.PurchaseId ?? ""}`} onClose={() => setViewing(null)} hideFooter width="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div><p className="text-gray-500 dark:text-gray-400">Branch</p><p className="font-medium text-gray-800 dark:text-white">{viewing.BranchDescription || viewing.BranchName}</p></div>
              <div><p className="text-gray-500 dark:text-gray-400">Supplier</p><p className="font-medium text-gray-800 dark:text-white">{viewing.SupplierName}</p></div>
              <div><p className="text-gray-500 dark:text-gray-400">Date</p><p className="font-medium text-gray-800 dark:text-white">{viewing.PurchaseDate?.slice(0, 10)}</p></div>
              <div><p className="text-gray-500 dark:text-gray-400">Status</p><Badge size="sm" color={statusColor[viewing.Status]}>{viewing.Status}</Badge></div>
            </div>
            {viewing.Status === "cancelled" && viewing.CancelReason && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">Cancelled: {viewing.CancelReason}</p>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Product", "Quantity", "Cost", "Total", ...(viewing.Status === "pending" ? ["Actions"] : [])].map((h) => <TableCell key={h} isHeader>{h}</TableCell>)}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {(viewing.Items ?? []).map((item) => (
                    <TableRow key={item.PurchaseItemId}>
                      <TableCell className="px-5 py-3">{item.ProductName}</TableCell>
                      <TableCell className="px-5 py-3">{item.Quantity}</TableCell>
                      <TableCell className="px-5 py-3">{money(item.CostPrice)}</TableCell>
                      <TableCell className="px-5 py-3">{money(item.Total)}</TableCell>
                      {viewing.Status === "pending" && (
                        <TableCell className="px-5 py-3">
                          <button onClick={() => removeViewingItem(item.PurchaseItemId)} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600">Remove</button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-right text-sm font-semibold">Total: {money(viewing.TotalAmount)}</p>
          </div>
        )}
      </Modal>

      {/* RECEIVE */}
      <Modal isOpen={!!receiving} title="Receive Purchase Order" onClose={() => setReceiving(null)} onConfirm={confirmReceive} confirmText="Receive" confirmColor="success" loading={saving} width="sm">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Receive purchase order #{receiving?.PurchaseId}? This will increase stock at {receiving?.BranchDescription || receiving?.BranchName} for every line item and cannot be reversed — a receiving mistake must be corrected with a manual inventory adjustment afterward.
        </p>
      </Modal>

      {/* CANCEL */}
      <Modal isOpen={!!cancelling} title="Cancel Purchase Order" onClose={() => { setCancelling(null); setCancelReason(""); }} onConfirm={confirmCancel} confirmText="Cancel Order" confirmColor="danger" loading={saving} width="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">Cancel purchase order #{cancelling?.PurchaseId}? No stock has been received yet, so this has no inventory effect.</p>
          <div>
            <label className="mb-2 block text-sm font-medium">Reason</label>
            <textarea rows={2} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* DELETE */}
      <Modal isOpen={!!deleting} title="Delete Purchase Order" onClose={() => setDeleting(null)} onConfirm={confirmDelete} confirmText="Delete" confirmColor="danger" loading={saving} width="sm">
        <p className="text-sm text-gray-600 dark:text-gray-300">Delete purchase order #{deleting?.PurchaseId}? This is only for orders created by mistake — it will be removed entirely.</p>
      </Modal>
    </>
  );
}
