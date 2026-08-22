import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { TerminalStatus } from "../../types/Dashboard";

interface TerminalStatusCardProps {
  data: TerminalStatus[];
  loading: boolean;
}

export default function TerminalStatusCard({ data, loading }: TerminalStatusCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Terminal Status</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No terminals found.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Terminal", "Branch", "Status", "Current Cashier", "Since"].map((h) => (
                  <TableCell key={h} isHeader>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => (
                <TableRow key={row.TerminalId}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.TerminalName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.BranchName}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge size="sm" color={row.Status === "Open" ? "success" : "light"}>
                      {row.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.CurrentCashierName ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {row.ShiftOpenedAt ? new Date(row.ShiftOpenedAt).toLocaleTimeString() : "-"}
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
