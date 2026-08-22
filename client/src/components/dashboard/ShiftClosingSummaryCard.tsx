import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { ShiftClosingSummary } from "../../types/Dashboard";

interface ShiftClosingSummaryCardProps {
  data: ShiftClosingSummary[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

// A variance within a peso either way is rounding noise, not worth flagging visually.
const VARIANCE_TOLERANCE = 1;

export default function ShiftClosingSummaryCard({ data, loading }: ShiftClosingSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Cashier Closing Summary</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No closed shifts for the selected filters.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Cashier", "Terminal", "Opening", "Expected", "Actual", "Variance", "Closed At"].map((h) => (
                  <TableCell key={h} isHeader>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => {
                const hasVariance = Math.abs(row.Variance) > VARIANCE_TOLERANCE;

                return (
                  <TableRow key={row.CashierShiftId} className={hasVariance ? "bg-warning-50 dark:bg-warning-500/10" : ""}>
                    <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.CashierName}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {row.TerminalName} / {row.BranchName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.OpeningCash)}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.ExpectedCash)}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.ActualCash)}</TableCell>
                    <TableCell className={`px-4 py-3 font-medium ${hasVariance ? (row.Variance < 0 ? "text-error-500" : "text-warning-500") : "text-gray-500 dark:text-gray-400"}`}>
                      {row.Variance >= 0 ? "+" : ""}
                      {money(row.Variance)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(row.ClosedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
