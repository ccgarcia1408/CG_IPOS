import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { PendingPurchase } from "../../types/Dashboard";

interface PendingPurchasesCardProps {
  data: PendingPurchase[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function PendingPurchasesCard({ data, loading }: PendingPurchasesCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Pending Purchases</h3>
        <Link to="/purchasing" className="text-xs font-medium text-brand-500 hover:text-brand-600">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No pending purchases.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Purchase #", "Supplier", "Branch", "Date", "Amount", "Status"].map((h) => (
                  <TableCell key={h} isHeader>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => (
                <TableRow key={row.PurchaseId}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">PO-{row.PurchaseId}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.SupplierName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.BranchName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(row.PurchaseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.TotalAmount)}</TableCell>
                  <TableCell className="px-4 py-3 capitalize text-warning-500">{row.Status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
