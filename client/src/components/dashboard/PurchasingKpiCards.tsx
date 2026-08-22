import { DollarLineIcon, TimeIcon, CheckCircleIcon, ErrorIcon } from "../../icons";
import { PurchasingSummary } from "../../types/Dashboard";

interface PurchasingKpiCardsProps {
  summary: PurchasingSummary | null;
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function PurchasingKpiCards({ summary, loading }: PurchasingKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-[110px] animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        No purchasing data available for the selected filters.
      </div>
    );
  }

  const cards = [
    { label: "Purchase Amount", value: money(summary.PurchaseAmount), icon: DollarLineIcon, colorClass: "" },
    {
      label: "Pending Purchases",
      value: `${summary.PendingCount} (${money(summary.PendingAmount)})`,
      icon: TimeIcon,
      colorClass: "text-warning-500",
    },
    {
      label: "Received Purchases",
      value: `${summary.ReceivedCount} (${money(summary.ReceivedAmount)})`,
      icon: CheckCircleIcon,
      colorClass: "text-success-500",
    },
    {
      label: "Cancelled Purchases",
      value: `${summary.CancelledCount} (${money(summary.CancelledAmount)})`,
      icon: ErrorIcon,
      colorClass: "text-error-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <card.icon className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
            <h4 className={`mt-2 text-title-sm font-bold ${card.colorClass || "text-gray-800 dark:text-white/90"}`}>
              {card.value}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
