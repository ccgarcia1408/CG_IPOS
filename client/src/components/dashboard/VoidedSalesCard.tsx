import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { VoidedSale } from "../../types/Dashboard";

interface VoidedSalesCardProps {
  data: VoidedSale[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function VoidedSalesCard({ data, loading }: VoidedSalesCardProps) {
  const totalVoidedAmount = data.reduce((sum, row) => sum + row.Total, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Voided / Cancelled Sales</h3>
        {data.length > 0 && (
          <Badge color="error">
            {data.length} &middot; {money(totalVoidedAmount)}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No voided or cancelled sales for the selected filters.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Sale #", "Cashier", "Branch/Terminal", "Amount", "Reason", "Date"].map((h) => (
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
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.CashierName ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {row.BranchName} / {row.TerminalName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-error-500">{money(row.Total)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.CancelReason ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {row.DateCancelled ? new Date(row.DateCancelled).toLocaleString() : "-"}
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
