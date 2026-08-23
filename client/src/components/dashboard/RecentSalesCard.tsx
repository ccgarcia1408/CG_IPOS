import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import { RecentSale } from "../../types/Dashboard";
import { Sale } from "../../types/Sale";

interface RecentSalesCardProps {
  data: RecentSale[];
  loading: boolean;
}

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);
const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function RecentSalesCard({ data, loading }: RecentSalesCardProps) {
  const [viewing, setViewing] = useState<Sale | null>(null);
  const [loadingSale, setLoadingSale] = useState(false);

  const openView = async (saleId: number) => {
    try {
      setLoadingSale(true);
      const response = await api.get<{ data: Sale }>(`/api/sales/${saleId}`, { auth: true });
      setViewing(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load sale details."));
    } finally {
      setLoadingSale(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Sales</h3>
        <Link to="/sales-history" className="text-sm font-medium text-brand-500 hover:text-brand-600">
          See all
        </Link>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No sales for the selected filters.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Sale #", "Date", "Cashier", "Amount", "Payment", "Status", "Actions"].map((h) => (
                  <TableCell key={h} isHeader>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => (
                <TableRow key={row.SaleId}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                    {row.ORNo ?? `#${row.SaleId}`}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(row.CreatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.CashierName ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.Total)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.PaymentMethodName ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge size="sm" color={row.Status === "Completed" ? "success" : "error"}>
                      {row.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <button
                      onClick={() => openView(row.SaleId)}
                      disabled={loadingSale}
                      className="rounded-lg bg-gray-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal isOpen={!!viewing} title={`Sale — OR #${viewing?.ORNo ?? ""}`} onClose={() => setViewing(null)} hideFooter width="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Branch</p>
                <p className="font-medium text-gray-800 dark:text-white">{viewing.BranchDescription || viewing.BranchName}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Terminal</p>
                <p className="font-medium text-gray-800 dark:text-white">{viewing.TerminalName}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Cashier</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {viewing.CashierFirstName} {viewing.CashierLastName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <Badge size="sm" color={viewing.IsCancelled ? "error" : "success"}>
                  {viewing.IsCancelled ? "Voided" : "Completed"}
                </Badge>
              </div>
            </div>
            {viewing.IsCancelled === 1 && viewing.CancelReason && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                Voided: {viewing.CancelReason}
              </p>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Product", "Qty", "Price", "Discount", "Total", "Returned"].map((h) => (
                      <TableCell key={h} isHeader>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {(viewing.Items ?? []).map((item) => (
                    <TableRow key={item.SaleItemId}>
                      <TableCell className="px-5 py-3 text-gray-800 dark:text-white">{item.ProductName}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{item.Quantity}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{money(item.Price)}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{money(item.Discount)}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{money(item.Total)}</TableCell>
                      <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-400">{item.QuantityReturned}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-white/[0.05]">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{money(viewing.SubTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Discount{viewing.DiscountName ? ` (${viewing.DiscountName})` : ""}</span>
                <span>{money(viewing.Discount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax{viewing.TaxName ? ` (${viewing.TaxName})` : ""}</span>
                <span>{money(viewing.Tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 dark:text-white">
                <span>Total</span>
                <span>{money(viewing.Total)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Need to void this sale or process a return? Use <Link to="/sales-history" className="text-brand-500 hover:text-brand-600">Sales History</Link>.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
