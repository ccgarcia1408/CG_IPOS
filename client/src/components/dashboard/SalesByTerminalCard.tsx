import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { SalesByTerminal } from "../../types/Dashboard";

interface SalesByTerminalCardProps {
  data: SalesByTerminal[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function SalesByTerminalCard({ data, loading }: SalesByTerminalCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Sales by Terminal</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No terminal data available.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Terminal", "Branch", "Sales", "Transactions", "Items Sold", "Avg. Transaction"].map((header) => (
                  <TableCell key={header} isHeader>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => (
                <TableRow key={row.TerminalId}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.TerminalName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.BranchName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(row.Sales)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Transactions}</TableCell>
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
