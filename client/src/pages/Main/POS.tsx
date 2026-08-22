import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/modal/Modal";
import SearchableSelect from "../../components/form/SearchableSelect";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { api, API_BASE_URL } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Branch } from "../../types/Branch";
import { Terminal } from "../../types/Terminal";
import { PaymentMethod } from "../../types/PaymentMethod";
import { Product } from "../../types/Product";
import { Sale } from "../../types/Sale";
import { Discount } from "../../types/Discount";
import { Tax } from "../../types/Tax";
import { ActiveOfficialReceiptAssignment } from "../../types/OfficialReceiptAssignment";
import { MyCashierShift } from "../../types/CashierShift";
import ReceiptPrint from "../../components/main/ReceiptPrint";

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
const money = (value: number | string) => `₱${Number(value).toFixed(2)}`;

type CartLine = {
  ProductId: number;
  Name: string;
  Price: number;
  Quantity: number;
  Discount: number;
  ImagePath: string | null;
};

export default function POS() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [orAssignment, setOrAssignment] = useState<ActiveOfficialReceiptAssignment | null>(null);

  const [branchId, setBranchId] = useState("");
  const [terminalId, setTerminalId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [productPick, setProductPick] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountId, setDiscountId] = useState("");
  const [taxId, setTaxId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const [myShift, setMyShift] = useState<MyCashierShift | null>(null);
  const [loadingShift, setLoadingShift] = useState(true);
  const [openingCash, setOpeningCash] = useState("");
  const [shiftBusy, setShiftBusy] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [closingCash, setClosingCash] = useState("");

  const barcodeRef = useRef<HTMLInputElement>(null);

  const loadMyShift = () => {
    setLoadingShift(true);
    api.get<{ data: MyCashierShift | null }>("/api/cashier-shifts/mine", { auth: true })
      .then((r) => {
        const shift = r.data ?? null;
        setMyShift(shift);
        if (shift) {
          setBranchId(String(shift.BranchId));
          setTerminalId(String(shift.TerminalId));
        }
      })
      .catch(() => toast.error("Failed to load your shift status."))
      .finally(() => setLoadingShift(false));
  };

  useEffect(() => {
    api.get<{ data: Branch[] }>("/api/branches/active", { auth: true }).then((r) => setBranches(r.data ?? [])).catch(() => toast.error("Failed to load branches."));
    api.get<{ data: Terminal[] }>("/api/terminals/active", { auth: true }).then((r) => setTerminals(r.data ?? [])).catch(() => toast.error("Failed to load terminals."));
    api.get<{ data: PaymentMethod[] }>("/api/payment-methods/active", { auth: true }).then((r) => setPaymentMethods(r.data ?? [])).catch(() => toast.error("Failed to load payment methods."));
    api.get<{ data: Product[] }>("/api/products/active", { auth: true }).then((r) => setProducts(r.data ?? [])).catch(() => toast.error("Failed to load products."));
    api.get<{ data: Discount[] }>("/api/discounts/active", { auth: true }).then((r) => setDiscounts(r.data ?? [])).catch(() => toast.error("Failed to load discounts."));
    api.get<{ data: Tax[] }>("/api/taxes/active", { auth: true }).then((r) => setTaxes(r.data ?? [])).catch(() => toast.error("Failed to load taxes."));
    api.get<{ data: ActiveOfficialReceiptAssignment | null }>("/api/or-assignments/me/active", { auth: true })
      .then((r) => setOrAssignment(r.data ?? null))
      .catch(() => toast.error("Failed to load your official receipt assignment."));
    loadMyShift();
  }, []);

  const handleOpenShift = async () => {
    if (!branchId || !terminalId) return toast.error("Select a branch and terminal first.");
    if (openingCash === "" || Number(openingCash) < 0) return toast.error("Enter a valid opening cash amount.");

    try {
      setShiftBusy(true);
      await api.post("/api/cashier-shifts", { BranchId: Number(branchId), TerminalId: Number(terminalId), OpeningCash: Number(openingCash) }, { auth: true });
      toast.success("Shift opened.");
      setOpeningCash("");
      loadMyShift();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to open shift."));
    } finally {
      setShiftBusy(false);
    }
  };

  const handleCloseShift = async () => {
    if (!myShift) return;
    if (closingCash === "" || Number(closingCash) < 0) return toast.error("Enter a valid actual cash amount.");

    try {
      setShiftBusy(true);
      const response = await api.put<{ data: { ExpectedCash: number; Variance: number } }>(
        `/api/cashier-shifts/${myShift.CashierShiftId}/close`,
        { ClosingCash: Number(closingCash) },
        { auth: true }
      );
      const variance = response.data?.Variance ?? 0;
      toast.success(`Shift closed. Variance: ${variance >= 0 ? "+" : ""}${money(variance)}`);
      setClosingCash("");
      setIsCloseShiftOpen(false);
      setMyShift(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to close shift."));
    } finally {
      setShiftBusy(false);
    }
  };

  useEffect(() => {
    barcodeRef.current?.focus();
  }, [branchId, terminalId]);

  const terminalsForBranch = useMemo(
    () => (branchId ? terminals.filter((t) => t.BranchId === Number(branchId)) : terminals),
    [terminals, branchId]
  );

  const subTotal = useMemo(() => cart.reduce((sum, line) => sum + line.Price * line.Quantity - line.Discount, 0), [cart]);
  const selectedDiscount = useMemo(() => discounts.find((d) => String(d.DiscountId) === discountId) ?? null, [discounts, discountId]);
  const selectedTax = useMemo(() => taxes.find((t) => String(t.TaxId) === taxId) ?? null, [taxes, taxId]);
  // Preview only — mirrors sp_sales_completeSale's server-side calculation (tax on the
  // post-discount amount). The authoritative amounts always come back from the SP itself.
  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;
    const raw = selectedDiscount.Type === "PERCENTAGE" ? subTotal * (selectedDiscount.Value / 100) : selectedDiscount.Value;
    return Math.min(raw, subTotal);
  }, [selectedDiscount, subTotal]);
  const taxAmount = useMemo(() => (selectedTax ? (subTotal - discountAmount) * (selectedTax.Rate / 100) : 0), [selectedTax, subTotal, discountAmount]);
  const total = useMemo(() => Math.max(subTotal - discountAmount + taxAmount, 0), [subTotal, discountAmount, taxAmount]);
  const change = useMemo(() => Math.max((Number(amountPaid) || 0) - total, 0), [amountPaid, total]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((line) => line.ProductId === product.ProductId);
      if (existing) {
        return current.map((line) => line.ProductId === product.ProductId ? { ...line, Quantity: line.Quantity + quantity } : line);
      }
      return [...current, { ProductId: product.ProductId, Name: product.Name, Price: Number(product.SellingPrice), Quantity: quantity, Discount: 0, ImagePath: product.ImagePath }];
    });
  };

  const handleScannedCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const product = products.find((p) => p.Barcode === trimmed || p.SKU === trimmed);
    if (!product) {
      toast.error(`No product found for "${trimmed}".`);
      return;
    }

    addToCart(product);
    toast.success(`${product.Name} added.`, { duration: 1200 });
  };

  const handleBarcodeSubmit = () => {
    handleScannedCode(barcode);
    setBarcode("");
  };

  // Fallback keyboard-wedge capture: if a barcode scanner fires while the
  // dedicated barcode field isn't focused (e.g. focus landed on a button
  // after closing a modal or removing a cart line), rapid keystrokes ending
  // in Enter are still treated as a scan. Only engages when no other input
  // is focused, so it never intercepts deliberate typing elsewhere.
  useEffect(() => {
    const SCAN_KEY_INTERVAL_MS = 60;
    const SCAN_MIN_LENGTH = 3;
    let buffer = "";
    let lastKeyTime = 0;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (receipt || isCloseShiftOpen) return;
      const active = document.activeElement;
      const isEditable = active instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
      if (isEditable) { buffer = ""; return; }

      const now = Date.now();
      if (e.key === "Enter") {
        if (buffer.length >= SCAN_MIN_LENGTH && now - lastKeyTime <= SCAN_KEY_INTERVAL_MS) {
          e.preventDefault();
          handleScannedCode(buffer);
          barcodeRef.current?.focus();
        }
        buffer = "";
        return;
      }
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) { buffer = ""; return; }
      buffer = now - lastKeyTime <= SCAN_KEY_INTERVAL_MS ? buffer + e.key : e.key;
      lastKeyTime = now;
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [receipt, isCloseShiftOpen, products]);

  const updateLine = (productId: number, patch: Partial<CartLine>) => {
    setCart((current) => current.map((line) => line.ProductId === productId ? { ...line, ...patch } : line));
  };

  const removeLine = (productId: number) => {
    setCart((current) => current.filter((line) => line.ProductId !== productId));
  };

  const resetSale = () => {
    setCart([]);
    setDiscountId("");
    setTaxId("");
    setAmountPaid("");
    setProductPick("");
    setBarcode("");
    barcodeRef.current?.focus();
  };

  const submitSale = async () => {
    if (!branchId || !terminalId) return toast.error("Select a branch and terminal.");
    if (!paymentMethodId) return toast.error("Select a payment method.");
    if (!cart.length) return toast.error("Cart is empty.");
    if ((Number(amountPaid) || 0) < total) return toast.error("Amount paid is less than the total.");

    try {
      setSaving(true);
      const response = await api.post<{ data: Sale }>(
        "/api/sales",
        {
          BranchId: Number(branchId),
          TerminalId: Number(terminalId),
          PaymentMethodId: Number(paymentMethodId),
          DiscountId: discountId ? Number(discountId) : null,
          TaxId: taxId ? Number(taxId) : null,
          AmountPaid: Number(amountPaid) || 0,
          Items: cart.map((line) => ({ ProductId: line.ProductId, Quantity: line.Quantity, Discount: line.Discount })),
        },
        { auth: true }
      );
      setReceipt(response.data);
      resetSale();
      api.get<{ data: ActiveOfficialReceiptAssignment | null }>("/api/or-assignments/me/active", { auth: true }).then((r) => setOrAssignment(r.data ?? null)).catch(() => undefined);
      api.get<{ data: Product[] }>("/api/products/active", { auth: true }).then((r) => setProducts(r.data ?? [])).catch(() => undefined);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to complete sale."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="CG_IPOS | POS" description="Point of sale checkout" />
      <PageBreadcrumb pageTitle="Point of Sale" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <ComponentCard title="Shift">
            {loadingShift ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading shift status...</p>
            ) : myShift ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <Badge size="sm" color="success">Shift Open</Badge>
                  <span className="ml-2">
                    {myShift.TerminalName} · Opened {new Date(myShift.OpenedAt).toLocaleString()} · Opening Cash {money(myShift.OpeningCash)}
                  </span>
                </div>
                <button
                  onClick={() => setIsCloseShiftOpen(true)}
                  className="rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
                >
                  Close Shift
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">Opening Cash</label>
                  <input
                    type="number" min={0} step="0.01"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    placeholder="e.g. 1000.00"
                    className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleOpenShift}
                  disabled={shiftBusy || !branchId || !terminalId}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {shiftBusy ? "Opening..." : "Open Shift"}
                </button>
              </div>
            )}
            {!myShift && !loadingShift && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Select a branch and terminal below, then open your shift. You can still complete sales without an open shift, but they won't count toward any shift's cash reconciliation.
              </p>
            )}
          </ComponentCard>

          <ComponentCard title="Branch & Terminal">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">Branch</label>
                <SearchableSelect
                  placeholder="Select a branch..."
                  value={branchId}
                  disabled={!!myShift}
                  onChange={(v) => { setBranchId(v); setTerminalId(""); }}
                  options={branches.map((b) => ({ value: String(b.BranchId), label: b.Description || b.Name }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Terminal</label>
                <SearchableSelect
                  placeholder="Select a terminal..."
                  value={terminalId}
                  disabled={!!myShift}
                  onChange={setTerminalId}
                  options={terminalsForBranch.map((t) => ({ value: String(t.TerminalId), label: t.Name }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Cashier</label>
                <input disabled value={user?.Username ?? ""} className="w-full rounded-lg border px-4 py-2 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400" />
              </div>
            </div>
            {myShift && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Branch and terminal are locked to your open shift. Close your shift to change them.</p>
            )}
            {orAssignment ? (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                OR range {orAssignment.ORFrom}–{orAssignment.ORTo} · {orAssignment.RemainingCount} remaining
              </p>
            ) : (
              <p className="mt-3 text-xs text-red-500">No official receipt range assigned to you. Checkout will be blocked until an administrator assigns one.</p>
            )}
          </ComponentCard>

          <ComponentCard title="Add Products">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Scan / Enter Barcode</label>
                <input
                  ref={barcodeRef}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleBarcodeSubmit(); } }}
                  placeholder="Scan barcode or type SKU, then Enter"
                  className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Search Product</label>
                <SearchableSelect
                  placeholder="Search by name..."
                  value={productPick}
                  onChange={(v) => {
                    const product = products.find((p) => String(p.ProductId) === v);
                    if (product) { addToCart(product); setProductPick(""); }
                  }}
                  options={products.map((p) => ({ value: String(p.ProductId), label: `${p.Name}${p.SKU ? ` (${p.SKU})` : ""}` }))}
                />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Cart">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Product", "Price", "Qty", "Discount", "Total", "Actions"].map((h) => <TableCell key={h} isHeader>{h}</TableCell>)}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {cart.length ? cart.map((line) => (
                    <TableRow key={line.ProductId}>
                      <TableCell className="px-5 py-3 font-medium text-gray-800 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                            {line.ImagePath && <img src={line.ImagePath.startsWith("/uploads/") ? `${API_BASE_URL}${line.ImagePath}` : line.ImagePath} alt={line.Name} className="h-full w-full object-cover" />}
                          </div>
                          <span>{line.Name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{money(line.Price)}</TableCell>
                      <TableCell className="px-5 py-3">
                        <input
                          type="number" min={1}
                          value={line.Quantity}
                          onChange={(e) => updateLine(line.ProductId, { Quantity: Math.max(1, Number(e.target.value) || 1) })}
                          className="w-20 rounded-lg border px-2 py-1 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <input
                          type="number" min={0} step="0.01"
                          value={line.Discount}
                          onChange={(e) => updateLine(line.ProductId, { Discount: Math.max(0, Number(e.target.value) || 0) })}
                          className="w-24 rounded-lg border px-2 py-1 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium text-gray-800 dark:text-white">{money(line.Price * line.Quantity - line.Discount)}</TableCell>
                      <TableCell className="px-5 py-3">
                        <button onClick={() => removeLine(line.ProductId)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Remove</button>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">Cart is empty. Scan a barcode or search a product.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        </div>

        <div className="space-y-5">
          <ComponentCard title="Payment">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Payment Method</label>
                <SearchableSelect
                  placeholder="Select payment method..."
                  value={paymentMethodId}
                  onChange={setPaymentMethodId}
                  options={paymentMethods.map((m) => ({ value: String(m.PaymentMethodId), label: m.Name }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">Discount</label>
                  <SearchableSelect
                    placeholder="None"
                    value={discountId}
                    onChange={setDiscountId}
                    options={discounts.map((d) => ({ value: String(d.DiscountId), label: `${d.Name} (${d.Type === "PERCENTAGE" ? `${d.Value}%` : money(d.Value)})` }))}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Tax</label>
                  <SearchableSelect
                    placeholder="None"
                    value={taxId}
                    onChange={setTaxId}
                    options={taxes.map((t) => ({ value: String(t.TaxId), label: `${t.Name} (${t.Rate}%)` }))}
                  />
                </div>
              </div>

              <div className="space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-white/[0.05]">
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{money(subTotal)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Discount</span><span>-{money(discountAmount)}</span></div>}
                {taxAmount > 0 && <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax</span><span>{money(taxAmount)}</span></div>}
                <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white"><span>Total</span><span>{money(total)}</span></div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Amount Paid</label>
                <input type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="w-full rounded-lg border px-4 py-2 text-lg dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400"><span>Change</span><span className="font-medium text-gray-800 dark:text-white">{money(change)}</span></div>

              <button
                onClick={submitSale}
                disabled={saving || !orAssignment}
                className="w-full rounded-lg bg-brand-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Processing..." : "Complete Sale"}
              </button>
            </div>
          </ComponentCard>
        </div>
      </div>

      <Modal
        isOpen={isCloseShiftOpen}
        title="Close Shift"
        onClose={() => setIsCloseShiftOpen(false)}
        onConfirm={handleCloseShift}
        confirmText={shiftBusy ? "Closing..." : "Close Shift"}
        width="sm"
      >
        {myShift && (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Opening Cash</span>
              <span className="font-medium text-gray-800 dark:text-white">{money(myShift.OpeningCash)}</span>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Actual Cash Counted</label>
              <input
                type="number" min={0} step="0.01"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                placeholder="Count the drawer and enter the total"
                className="w-full rounded-lg border px-4 py-2 text-lg dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Expected cash and variance are calculated automatically once you close the shift.
            </p>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!receipt} title="Sale Completed" onClose={() => setReceipt(null)} hideFooter width="sm">
        {receipt && (
          <div className="space-y-3 text-sm">
            <div className="text-center">
              <Badge size="sm" color="success">OR #{receipt.ORNo}</Badge>
            </div>
            {(receipt.Items ?? []).map((item) => (
              <div key={item.SaleItemId} className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{item.ProductName} × {item.Quantity}</span>
                <span>{money(item.Total)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 dark:border-white/[0.05]">
              <div className="flex justify-between font-semibold text-gray-800 dark:text-white"><span>Total</span><span>{money(receipt.Total)}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Paid</span><span>{money(receipt.AmountPaid)}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Change</span><span>{money(receipt.ChangeAmount)}</span></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setReceipt(null)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium dark:border-white/10 dark:text-gray-300">Skip</button>
              <button type="button" onClick={() => { window.print(); setReceipt(null); }} className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Print Receipt</button>
            </div>
          </div>
        )}
      </Modal>

      <ReceiptPrint sale={receipt} />
    </>
  );
}
