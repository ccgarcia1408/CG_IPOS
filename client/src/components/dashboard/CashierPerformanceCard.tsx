import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { CashierPerformance } from "../../types/Dashboard";

interface CashierPerformanceCardProps {
  data: CashierPerformance[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function CashierPerformanceCard({ data, loading }: CashierPerformanceCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Cashier Performance</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No cashier activity for the selected filters.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Cashier", "Branch", "Transactions", "Sales", "Items Sold", "Avg. Transaction"].map((h) => (
                  <TableCell key={h} isHeader>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => (
                <TableRow key={`${row.CashierId}-${row.BranchId}`}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.CashierName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.BranchName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Transactions}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.Sales)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.ItemsSold}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.AverageTransactionValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
