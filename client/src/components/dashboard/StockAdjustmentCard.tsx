import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { RecentStockAdjustment, StockAdjustmentSummary } from "../../types/Dashboard";

interface StockAdjustmentCardProps {
  summary: StockAdjustmentSummary | null;
  recent: RecentStockAdjustment[];
  loading: boolean;
}

export default function StockAdjustmentCard({ summary, recent, loading }: StockAdjustmentCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Stock Adjustments</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Adjustments</p>
              <p className="mt-1 text-lg font-bold text-gray-800 dark:text-white">{summary?.AdjustmentCount ?? 0}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Stock Added</p>
              <p className="mt-1 text-lg font-bold text-success-500">+{summary?.StockAdded ?? 0}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Stock Removed</p>
              <p className="mt-1 text-lg font-bold text-error-500">-{summary?.StockRemoved ?? 0}</p>
            </div>
          </div>

          {recent.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">No stock adjustments for the selected filters.</div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Date", "Product", "Branch", "Quantity", "Reason", "User"].map((h) => (
                      <TableCell key={h} isHeader>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {recent.map((row) => (
                    <TableRow key={row.InventoryLogId}>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {new Date(row.CreatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.ProductName}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.BranchName}</TableCell>
                      <TableCell className={`px-4 py-3 ${row.Quantity >= 0 ? "text-success-500" : "text-error-500"}`}>
                        {row.Quantity >= 0 ? `+${row.Quantity}` : row.Quantity}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.Reason ?? "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.UserName ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
