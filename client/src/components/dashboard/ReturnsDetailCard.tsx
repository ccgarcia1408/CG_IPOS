import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { ReturnReason, TopReturnedProduct } from "../../types/Dashboard";

interface ReturnsDetailCardProps {
  reasons: ReturnReason[];
  topReturned: TopReturnedProduct[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function ReturnsDetailCard({ reasons, topReturned, loading }: ReturnsDetailCardProps) {
  const totalReturns = reasons.reduce((sum, r) => sum + r.ReturnCount, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Returns</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">By Reason</p>
            {reasons.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">No returns for the selected filters.</div>
            ) : (
              <div className="space-y-3">
                {reasons.map((row) => (
                  <div key={row.Reason}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{row.Reason}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {row.ReturnCount} &middot; {money(row.RefundAmount)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                      <div
                        className="h-full rounded-full bg-warning-500"
                        style={{ width: `${totalReturns > 0 ? (row.ReturnCount / totalReturns) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Top Returned Products</p>
            {topReturned.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">No returned products for the selected filters.</div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                    <TableRow>
                      {["Product", "Qty", "Value"].map((h) => (
                        <TableCell key={h} isHeader>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {topReturned.map((row) => (
                      <TableRow key={row.ProductId}>
                        <TableCell className="px-3 py-2 font-medium text-gray-800 dark:text-white">{row.ProductName}</TableCell>
                        <TableCell className="px-3 py-2 text-gray-600 dark:text-gray-300">{row.QuantityReturned}</TableCell>
                        <TableCell className="px-3 py-2 text-gray-600 dark:text-gray-300">{money(row.ReturnValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
