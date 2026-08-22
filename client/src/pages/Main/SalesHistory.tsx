import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/modal/Modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../services/api";
import { Sale, SaleItem } from "../../types/Sale";
import ReceiptPrint from "../../components/main/ReceiptPrint";

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
const money = (value: number | string) => `₱${Number(value).toFixed(2)}`;

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewing, setViewing] = useState<Sale | null>(null);
  const [voiding, setVoiding] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [returning, setReturning] = useState<SaleItem | null>(null);
  const [returnQty, setReturnQty] = useState("1");
  const [returnReason, setReturnReason] = useState("");
  const [printingSale, setPrintingSale] = useState<Sale | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Sale[] }>("/api/sales", { auth: true });
      setSales(response.data ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load sales."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? sales.filter((s) => [s.ORNo, s.BranchDescription, s.BranchName, s.TerminalName, `${s.CashierFirstName} ${s.CashierLastName}`, String(s.SaleId)].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)))
      : sales;
  }, [sales, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const openView = async (sale: Sale) => {
    try {
      const response = await api.get<{ data: Sale }>(`/api/sales/${sale.SaleId}`, { auth: true });
      setViewing(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load sale details."));
    }
  };

  const refreshViewing = async () => {
    if (!viewing) return;
    const response = await api.get<{ data: Sale }>(`/api/sales/${viewing.SaleId}`, { auth: true });
    setViewing(response.data);
  };

  const printSale = async (saleId: number) => {
    try {
      const response = await api.get<{ data: Sale }>(`/api/sales/${saleId}`, { auth: true });
      setPrintingSale(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load sale for printing."));
    }
  };

  useEffect(() => {
    if (!printingSale) return;
    const timer = setTimeout(() => window.print(), 150);
    return () => clearTimeout(timer);
  }, [printingSale]);

  const confirmVoid = async () => {
    if (!voiding) return;
    if (!voidReason.trim()) return toast.error("A reason is required to void a sale.");
    try {
      setSaving(true);
      await api.post(`/api/sales/${voiding.SaleId}/void`, { Reason: voidReason.trim() }, { auth: true });
      toast.success("Sale voided successfully.");
      setVoiding(null);
      setVoidReason("");
      await load();
      if (viewing?.SaleId === voiding.SaleId) await refreshViewing();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to void sale."));
    } finally {
      setSaving(false);
    }
  };

  const confirmReturn = async () => {
    if (!returning) return;
    const quantity = Number(returnQty);
    if (!Number.isInteger(quantity) || quantity <= 0) return toast.error("Quantity must be a positive whole number.");
    if (!returnReason.trim()) return toast.error("A reason is required for a return.");
    try {
      setSaving(true);
      await api.post(`/api/sales/items/${returning.SaleItemId}/return`, { QuantityReturned: quantity, Reason: returnReason.trim() }, { auth: true });
      toast.success("Return processed successfully.");
      setReturning(null);
      setReturnQty("1");
      setReturnReason("");
      await load();
      await refreshViewing();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to process return."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="CG_IPOS | Sales History" description="Sales transaction history" />
      <PageBreadcrumb pageTitle="Sales History" />
      <ComponentCard title="Sales">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by OR#, branch, terminal, or cashier..."
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

        {loading ? <p className="text-gray-800 dark:text-white">Loading sales...</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                <TableRow>
                  {["OR#", "Branch", "Terminal", "Cashier", "Items", "Total", "Status", "Actions"].map((h) => <TableCell key={h} isHeader>{h}</TableCell>)}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginated.length ? paginated.map((sale) => (
                  <TableRow key={sale.SaleId}>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{sale.ORNo}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{sale.BranchDescription || sale.BranchName}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{sale.TerminalName}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{sale.CashierFirstName} {sale.CashierLastName}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{sale.ItemCount ?? "-"}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{money(sale.Total)}</TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge size="sm" color={sale.IsCancelled ? "error" : "success"}>{sale.IsCancelled ? "Voided" : "Completed"}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openView(sale)} className="rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600">View</button>
                        <button onClick={() => printSale(sale.SaleId)} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">Print</button>
                        {!sale.IsCancelled && (
                          <button onClick={() => setVoiding(sale)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Void</button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">No sales found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-white/[0.05] md:flex-row">
          <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:text-gray-400 dark:border-white/10 dark:text-gray-300">Previous</button>
            {Array.from({ length: totalPages }, (_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === i + 1 ? "bg-brand-500 text-white" : "border dark:border-white/10 dark:text-gray-300"}`}>{i + 1}</button>)}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:text-gray-400 dark:border-white/10 dark:text-gray-300">Next</button>
          </div>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded-lg border px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300">
            <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
          </select>
        </div>
      </ComponentCard>

      <Modal isOpen={!!viewing} title={`Sale — OR #${viewing?.ORNo ?? ""}`} onClose={() => setViewing(null)} hideFooter width="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div><p className="text-gray-500 dark:text-gray-400">Branch</p><p className="font-medium text-gray-800 dark:text-white">{viewing.BranchDescription || viewing.BranchName}</p></div>
              <div><p className="text-gray-500 dark:text-gray-400">Terminal</p><p className="font-medium text-gray-800 dark:text-white">{viewing.TerminalName}</p></div>
              <div><p className="text-gray-500 dark:text-gray-400">Cashier</p><p className="font-medium text-gray-800 dark:text-white">{viewing.CashierFirstName} {viewing.CashierLastName}</p></div>
              <div><p className="text-gray-500 dark:text-gray-400">Status</p><Badge size="sm" color={viewing.IsCancelled ? "error" : "success"}>{viewing.IsCancelled ? "Voided" : "Completed"}</Badge></div>
            </div>
            {viewing.IsCancelled === 1 && viewing.CancelReason && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">Voided: {viewing.CancelReason}</p>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>{["Product", "Qty", "Price", "Discount", "Total", "Returned", "Actions"].map((h) => <TableCell key={h} isHeader>{h}</TableCell>)}</TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {(viewing.Items ?? []).map((item) => {
                    const remaining = item.Quantity - item.QuantityReturned;
                    return (
                      <TableRow key={item.SaleItemId}>
                        <TableCell className="px-5 py-3 text-gray-800 dark:text-white">{item.ProductName}</TableCell>
                        <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{item.Quantity}</TableCell>
                        <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{money(item.Price)}</TableCell>
                        <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{money(item.Discount)}</TableCell>
                        <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{money(item.Total)}</TableCell>
                        <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{item.QuantityReturned}</TableCell>
                        <TableCell className="px-5 py-3">
                          {!viewing.IsCancelled && remaining > 0 && (
                            <button onClick={() => { setReturning(item); setReturnQty(String(remaining)); setReturnReason(""); }} className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600">Return</button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {(viewing.Returns ?? []).length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">Return History</p>
                <div className="space-y-1 text-sm">
                  {(viewing.Returns ?? []).map((r) => (
                    <div key={r.SaleReturnId} className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{r.ProductName} × {r.QuantityReturned} — {r.Reason}</span>
                      <span>{money(r.RefundAmount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-white/[0.05]">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{money(viewing.SubTotal)}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Discount</span><span>{money(viewing.Discount)}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax</span><span>{money(viewing.Tax)}</span></div>
              <div className="flex justify-between font-semibold text-gray-800 dark:text-white"><span>Total</span><span>{money(viewing.Total)}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!voiding} title="Void Sale" onClose={() => { setVoiding(null); setVoidReason(""); }} onConfirm={confirmVoid} confirmText="Void Sale" confirmColor="danger" loading={saving} width="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">Void OR #{voiding?.ORNo}? All stock from this sale will be restored and the OR number will never be reused.</p>
          <div>
            <label className="mb-2 block text-sm font-medium">Reason</label>
            <textarea rows={2} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={voidReason} onChange={(e) => setVoidReason(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!returning} title="Process Return" onClose={() => setReturning(null)} onConfirm={confirmReturn} confirmText="Process Return" confirmColor="danger" loading={saving} width="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">Returning <strong>{returning?.ProductName}</strong>. Stock will be restored for the returned quantity.</p>
          <div>
            <label className="mb-2 block text-sm font-medium">Quantity to Return</label>
            <input type="number" min={1} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={returnQty} onChange={(e) => setReturnQty(e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Reason</label>
            <textarea rows={2} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} />
          </div>
        </div>
      </Modal>

      <ReceiptPrint sale={printingSale} />
    </>
  );
}
