import { useState } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { ExpiringProduct, ExpiringThreshold, LowStockAlert, OutOfStockAlert } from "../../types/Dashboard";

type AlertTab = "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRING";

interface InventoryAlertsCardProps {
  lowStock: LowStockAlert[];
  outOfStock: OutOfStockAlert[];
  expiring: ExpiringProduct[];
  loading: boolean;
  expiringThreshold: ExpiringThreshold;
  onExpiringThresholdChange: (threshold: ExpiringThreshold) => void;
}

export default function InventoryAlertsCard({
  lowStock,
  outOfStock,
  expiring,
  loading,
  expiringThreshold,
  onExpiringThresholdChange,
}: InventoryAlertsCardProps) {
  const [tab, setTab] = useState<AlertTab>("LOW_STOCK");

  const tabs: { value: AlertTab; label: string; count: number }[] = [
    { value: "LOW_STOCK", label: "Low Stock", count: lowStock.length },
    { value: "OUT_OF_STOCK", label: "Out of Stock", count: outOfStock.length },
    { value: "EXPIRING", label: "Expiring Soon", count: expiring.length },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Inventory Alerts</h3>

        {tab === "EXPIRING" && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-white/10">
            {([7, 15, 30] as ExpiringThreshold[]).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onExpiringThresholdChange(days)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  expiringThreshold === days
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-white/10">
        {tabs.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition ${
              tab === option.value
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {option.label}
            <Badge size="sm" color={option.value === "OUT_OF_STOCK" ? "error" : "warning"}>
              {option.count}
            </Badge>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          {tab === "LOW_STOCK" &&
            (lowStock.length === 0 ? (
              <EmptyState message="No products are low on stock." />
            ) : (
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Product", "SKU", "Branch", "Current Stock", "Minimum Stock", "Difference", "Actions"].map((h) => (
                      <TableCell key={h} isHeader>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {lowStock.map((row) => (
                    <TableRow key={row.ProductId}>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.ProductName}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.SKU}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.BranchName}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.CurrentStock}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.MinimumStock}</TableCell>
                      <TableCell className="px-4 py-3 text-warning-500">-{row.StockDifference}</TableCell>
                      <ActionsCell />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}

          {tab === "OUT_OF_STOCK" &&
            (outOfStock.length === 0 ? (
              <EmptyState message="No products are out of stock." />
            ) : (
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Product", "SKU", "Branch", "Actions"].map((h) => (
                      <TableCell key={h} isHeader>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {outOfStock.map((row) => (
                    <TableRow key={row.ProductId}>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.ProductName}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.SKU}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.BranchName}</TableCell>
                      <ActionsCell />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}

          {tab === "EXPIRING" &&
            (expiring.length === 0 ? (
              <EmptyState message={`No products expiring within ${expiringThreshold} days.`} />
            ) : (
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                  <TableRow>
                    {["Product", "Branch", "Quantity", "Expiry Date", "Days Remaining", "Actions"].map((h) => (
                      <TableCell key={h} isHeader>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {expiring.map((row) => (
                    <TableRow key={row.ProductId}>
                      <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">{row.ProductName}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.BranchName}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Quantity}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {new Date(row.ExpiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-warning-500">{row.DaysRemaining}d</TableCell>
                      <ActionsCell />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="py-10 text-center text-sm text-gray-400">{message}</div>;
}

function ActionsCell() {
  return (
    <TableCell className="px-4 py-3">
      <Link to="/inventory" className="text-xs font-medium text-brand-500 hover:text-brand-600">
        View Inventory
      </Link>
    </TableCell>
  );
}
