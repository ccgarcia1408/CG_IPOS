import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { ActiveShift } from "../../types/Dashboard";

interface ActiveShiftsCardProps {
  data: ActiveShift[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function ActiveShiftsCard({ data, loading }: ActiveShiftsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Active Cashier Shifts</h3>
        {data.length > 0 && <Badge color="success">{data.length} open</Badge>}
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No open shifts right now.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Cashier", "Terminal", "Opened At", "Opening Cash", "Current Sales", "Current Cash"].map((h) => (
                  <TableCell key={h} isHeader>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => (
                <TableRow key={row.CashierShiftId}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.CashierName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {row.TerminalName} / {row.BranchName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(row.OpenedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.OpeningCash)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.CurrentSales)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.CurrentCashPayments)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
