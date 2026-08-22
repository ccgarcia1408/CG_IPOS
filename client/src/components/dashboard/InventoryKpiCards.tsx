import { BoxIconLine, BoxCubeIcon, DollarLineIcon, AlertIcon, TrashBinIcon, TimeIcon } from "../../icons";
import { InventorySummary } from "../../types/Dashboard";

interface InventoryKpiCardsProps {
  summary: InventorySummary | null;
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

const CARDS: {
  key: keyof InventorySummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  format: (value: number) => string;
  colorClass?: string;
}[] = [
  { key: "TotalActiveProducts", label: "Active Products", icon: BoxCubeIcon, format: (v) => v.toLocaleString() },
  { key: "TotalInventoryUnits", label: "Inventory Units", icon: BoxIconLine, format: (v) => v.toLocaleString() },
  { key: "TotalInventoryValue", label: "Inventory Value", icon: DollarLineIcon, format: money },
  { key: "LowStockCount", label: "Low Stock Products", icon: AlertIcon, format: (v) => v.toLocaleString(), colorClass: "text-warning-500" },
  { key: "OutOfStockCount", label: "Out-of-Stock Products", icon: TrashBinIcon, format: (v) => v.toLocaleString(), colorClass: "text-error-500" },
  { key: "ExpiringSoonCount", label: "Expiring Soon", icon: TimeIcon, format: (v) => v.toLocaleString(), colorClass: "text-warning-500" },
];

export default function InventoryKpiCards({ summary, loading }: InventoryKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="h-[110px] animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        No inventory data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {CARDS.map(({ key, label, icon: Icon, format, colorClass }) => (
        <div
          key={key}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <Icon className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <h4 className={`mt-2 text-title-sm font-bold ${colorClass ?? "text-gray-800 dark:text-white/90"}`}>
              {format(summary[key] as number)}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
