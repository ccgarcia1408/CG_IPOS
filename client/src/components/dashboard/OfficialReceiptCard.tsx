import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { OfficialReceiptSummary, OrAssignmentStatus } from "../../types/Dashboard";

interface OfficialReceiptCardProps {
  summary: OfficialReceiptSummary | null;
  assignments: OrAssignmentStatus[];
  loading: boolean;
}

export default function OfficialReceiptCard({ summary, assignments, loading }: OfficialReceiptCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Official Receipts</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">ORs Issued</p>
              <p className="mt-1 text-lg font-bold text-gray-800 dark:text-white">{summary?.IssuedCount ?? 0}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">ORs Voided</p>
              <p className="mt-1 text-lg font-bold text-error-500">{summary?.VoidedCount ?? 0}</p>
            </div>
          </div>

          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Remaining OR Assignment</p>
          {assignments.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">No OR ranges assigned.</div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Cashier", "Range", "Last Used", "Remaining"].map((h) => (
                      <TableCell key={h} isHeader>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {assignments.map((row) => (
                    <TableRow key={row.ORAssignmentId}>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.CashierName}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {row.ORFrom} - {row.ORTo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.LastORUsed ?? "-"}</TableCell>
                      <TableCell
                        className={`px-4 py-3 ${row.RemainingCount <= 5 ? "text-warning-500" : "text-gray-600 dark:text-gray-300"}`}
                      >
                        {row.RemainingCount}
                      </TableCell>
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
