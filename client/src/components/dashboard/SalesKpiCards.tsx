import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarLineIcon,
  GroupIcon,
  BoxIconLine,
  ShootingStarIcon,
  PieChartIcon,
  TrashBinIcon,
  AlertIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { KpiComparison, SalesSummary } from "../../types/Dashboard";

interface SalesKpiCardsProps {
  summary: SalesSummary | null;
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

const CARDS: {
  key: keyof SalesSummary;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  format: (value: number) => string;
}[] = [
  { key: "GrossSales", label: "Gross Sales", icon: DollarLineIcon, format: money },
  { key: "NetSales", label: "Net Sales", icon: DollarLineIcon, format: money },
  { key: "CompletedTransactions", label: "Completed Transactions", icon: GroupIcon, format: (v) => v.toLocaleString() },
  { key: "ItemsSold", label: "Items Sold", icon: BoxIconLine, format: (v) => v.toLocaleString() },
  { key: "AverageTransactionValue", label: "Average Transaction", icon: ShootingStarIcon, format: money },
  { key: "TotalDiscounts", label: "Total Discounts", icon: PieChartIcon, format: money },
  { key: "TotalReturns", label: "Total Returns", icon: TrashBinIcon, format: money },
  { key: "VoidedSales", label: "Voided / Cancelled Sales", icon: AlertIcon, format: money },
];

function ChangeBadge({ percentChange }: { percentChange: number | null }) {
  if (percentChange === null || percentChange === 0) {
    return <Badge color="light">{percentChange === null ? "N/A" : "0.00%"}</Badge>;
  }

  const isPositive = percentChange > 0;

  return (
    <Badge color={isPositive ? "success" : "error"}>
      {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
      {Math.abs(percentChange).toFixed(2)}%
    </Badge>
  );
}

export default function SalesKpiCards({ summary, loading }: SalesKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="h-[132px] animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        No sales data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {CARDS.map(({ key, label, icon: Icon, format }) => {
        const kpi = summary[key] as KpiComparison;

        return (
          <div
            key={key}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              <Icon className="size-6 text-gray-800 dark:text-white/90" />
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
                  {format(kpi.Current)}
                </h4>
              </div>
              <ChangeBadge percentChange={kpi.PercentChange} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
