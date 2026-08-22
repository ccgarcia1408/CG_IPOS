import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { RecentSale } from "../../types/Dashboard";

interface RecentSalesCardProps {
  data: RecentSale[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function RecentSalesCard({ data, loading }: RecentSalesCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Recent Sales</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No sales for the selected filters.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Sale #", "Date", "Cashier", "Amount", "Payment", "Status"].map((h) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
