import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { SalesByBranch } from "../../types/Dashboard";

interface SalesByBranchCardProps {
  data: SalesByBranch[];
  loading: boolean;
}

type SortOption = "SALES_DESC" | "SALES_ASC" | "TRANSACTIONS_DESC" | "AVG_DESC";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "SALES_DESC", label: "Highest Sales" },
  { value: "SALES_ASC", label: "Lowest Sales" },
  { value: "TRANSACTIONS_DESC", label: "Most Transactions" },
  { value: "AVG_DESC", label: "Highest Average Transaction" },
];

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function SalesByBranchCard({ data, loading }: SalesByBranchCardProps) {
  const [sort, setSort] = useState<SortOption>("SALES_DESC");

  const sorted = useMemo(() => {
    const rows = [...data];
    switch (sort) {
      case "SALES_ASC":
        return rows.sort((a, b) => a.Sales - b.Sales);
      case "TRANSACTIONS_DESC":
        return rows.sort((a, b) => b.Transactions - a.Transactions);
      case "AVG_DESC":
        return rows.sort((a, b) => b.AverageTransactionValue - a.AverageTransactionValue);
      case "SALES_DESC":
      default:
        return rows.sort((a, b) => b.Sales - a.Sales);
    }
  }, [data, sort]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Sales by Branch</h3>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs dark:border-white/10 dark:bg-gray-900 dark:text-gray-300"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No branch data available.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Branch", "Sales", "Transactions", "Items Sold", "Avg. Transaction"].map((header) => (
                  <TableCell key={header} isHeader>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {sorted.map((row) => (
                <TableRow key={row.BranchId}>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.BranchName}</TableCell>
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
