import { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { TopCategory } from "../../types/Dashboard";

interface TopCategoriesCardProps {
  data: TopCategory[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

const COLORS = ["#465FFF", "#9CB9FF", "#0BA5EC", "#F79009", "#12B76A", "#F04438", "#7A5AF8", "#EE46BC"];

export default function TopCategoriesCard({ data, loading }: TopCategoriesCardProps) {
  const options: ApexOptions = useMemo(
    () => ({
      chart: { fontFamily: "Outfit, sans-serif", type: "donut" },
      labels: data.map((row) => row.CategoryName),
      colors: COLORS,
      legend: { position: "bottom" },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (value: number) => money(value) } },
    }),
    [data]
  );

  const series = useMemo(() => data.map((row) => row.Sales), [data]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Top-Selling Categories</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No category sales for the selected filters.</div>
      ) : (
        <Chart options={options} series={series} type="donut" height={280} />
      )}
    </div>
  );
}
