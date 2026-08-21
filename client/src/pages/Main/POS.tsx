import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/modal/Modal";
import SearchableSelect from "../../components/form/SearchableSelect";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Branch } from "../../types/Branch";
import { Terminal } from "../../types/Terminal";
import { PaymentMethod } from "../../types/PaymentMethod";
import { Product } from "../../types/Product";
import { Sale } from "../../types/Sale";
import { ActiveOfficialReceiptAssignment } from "../../types/OfficialReceiptAssignment";

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
const money = (value: number | string) => `₱${Number(value).toFixed(2)}`;

type CartLine = {
  ProductId: number;
  Name: string;
  Price: number;
  Quantity: number;
  Discount: number;
};

export default function POS() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orAssignment, setOrAssignment] = useState<ActiveOfficialReceiptAssignment | null>(null);

  const [branchId, setBranchId] = useState("");
  const [terminalId, setTerminalId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [productPick, setProductPick] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [headerDiscount, setHeaderDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [amountPaid, setAmountPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<{ data: Branch[] }>("/api/branches/active", { auth: true }).then((r) => setBranches(r.data ?? [])).catch(() => toast.error("Failed to load branches."));
    api.get<{ data: Terminal[] }>("/api/terminals/active", { auth: true }).then((r) => setTerminals(r.data ?? [])).catch(() => toast.error("Failed to load terminals."));
    api.get<{ data: PaymentMethod[] }>("/api/payment-methods/active", { auth: true }).then((r) => setPaymentMethods(r.data ?? [])).catch(() => toast.error("Failed to load payment methods."));
    api.get<{ data: Product[] }>("/api/products/active", { auth: true }).then((r) => setProducts(r.data ?? [])).catch(() => toast.error("Failed to load products."));
    api.get<{ data: ActiveOfficialReceiptAssignment | null }>("/api/or-assignments/me/active", { auth: true })
      .then((r) => setOrAssignment(r.data ?? null))
      .catch(() => toast.error("Failed to load your official receipt assignment."));
  }, []);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, [branchId, terminalId]);

  const terminalsForBranch = useMemo(
    () => (branchId ? terminals.filter((t) => t.BranchId === Number(branchId)) : terminals),
    [terminals, branchId]
  );

  const subTotal = useMemo(() => cart.reduce((sum, line) => sum + line.Price * line.Quantity - line.Discount, 0), [cart]);
  const total = useMemo(() => Math.max(subTotal - (Number(headerDiscount) || 0) + (Number(tax) || 0), 0), [subTotal, headerDiscount, tax]);
  const change = useMemo(() => Math.max((Number(amountPaid) || 0) - total, 0), [amountPaid, total]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((line) => line.ProductId === product.ProductId);
      if (existing) {
        return current.map((line) => line.ProductId === product.ProductId ? { ...line, Quantity: line.Quantity + quantity } : line);
      }
      return [...current, { ProductId: product.ProductId, Name: product.Name, Price: Number(product.SellingPrice), Quantity: quantity, Discount: 0 }];
    });
  };

  const handleBarcodeSubmit = () => {
    const code = barcode.trim();
    if (!code) return;

    const product = products.find((p) => p.Barcode === code || p.SKU === code);
    if (!product) {
      toast.error(`No product found for "${code}".`);
      setBarcode("");
      return;
    }

    addToCart(product);
    setBarcode("");
    toast.success(`${product.Name} added.`, { duration: 1200 });
  };

  const updateLine = (productId: number, patch: Partial<CartLine>) => {
    setCart((current) => current.map((line) => line.ProductId === productId ? { ...line, ...patch } : line));
  };

  const removeLine = (productId: number) => {
    setCart((current) => current.filter((line) => line.ProductId !== productId));
  };

  const resetSale = () => {
    setCart([]);
    setHeaderDiscount("0");
    setTax("0");
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
          Discount: Number(headerDiscount) || 0,
          Tax: Number(tax) || 0,
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
          <ComponentCard title="Branch & Terminal">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">Branch</label>
                <SearchableSelect
                  placeholder="Select a branch..."
                  value={branchId}
                  onChange={(v) => { setBranchId(v); setTerminalId(""); }}
                  options={branches.map((b) => ({ value: String(b.BranchId), label: b.Description || b.Name }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Terminal</label>
                <SearchableSelect
                  placeholder="Select a terminal..."
                  value={terminalId}
                  onChange={setTerminalId}
                  options={terminalsForBranch.map((t) => ({ value: String(t.TerminalId), label: t.Name }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Cashier</label>
                <input disabled value={user?.Username ?? ""} className="w-full rounded-lg border px-4 py-2 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400" />
              </div>
            </div>
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
                      <TableCell className="px-5 py-3 font-medium text-gray-800 dark:text-white">{line.Name}</TableCell>
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
                  <input type="number" min={0} step="0.01" value={headerDiscount} onChange={(e) => setHeaderDiscount(e.target.value)} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Tax</label>
                  <input type="number" min={0} step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                </div>
              </div>

              <div className="space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-white/[0.05]">
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{money(subTotal)}</span></div>
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

      <Modal isOpen={!!receipt} title="Sale Completed" onClose={() => setReceipt(null)} confirmText="New Sale" onConfirm={() => setReceipt(null)} hideFooter={false} width="sm">
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
          </div>
        )}
      </Modal>
    </>
  );
}
