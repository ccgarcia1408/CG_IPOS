import { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { SalesTrendGranularity, SalesTrendPoint } from "../../types/Dashboard";

interface SalesTrendChartProps {
  data: SalesTrendPoint[];
  loading: boolean;
  granularity: SalesTrendGranularity;
  onGranularityChange: (granularity: SalesTrendGranularity) => void;
}

const GRANULARITY_OPTIONS: { value: SalesTrendGranularity; label: string }[] = [
  { value: "HOURLY", label: "Hourly" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

const METRIC_OPTIONS: { value: keyof SalesTrendPoint; label: string }[] = [
  { value: "GrossSales", label: "Gross Sales" },
  { value: "NetSales", label: "Net Sales" },
  { value: "Transactions", label: "Transactions" },
  { value: "ItemsSold", label: "Items Sold" },
];

export default function SalesTrendChart({
  data,
  loading,
  granularity,
  onGranularityChange,
}: SalesTrendChartProps) {
  const [metric, setMetric] = useState<keyof SalesTrendPoint>("GrossSales");

  const categories = useMemo(() => data.map((point) => point.PeriodLabel), [data]);
  const series = useMemo(
    () => [
      {
        name: METRIC_OPTIONS.find((option) => option.value === metric)?.label ?? "",
        data: data.map((point) => Number(point[metric])),
      },
    ],
    [data, metric]
  );

  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 0, strokeWidth: 2, hover: { size: 6 } },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Sales Overview</h3>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-white/10">
            {METRIC_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMetric(option.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  metric === option.value
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-white/10">
            {GRANULARITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onGranularityChange(option.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  granularity === option.value
                    ? "bg-brand-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[310px] items-center justify-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="flex h-[310px] items-center justify-center text-sm text-gray-400">
          No sales data available for the selected filters.
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px]">
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}
