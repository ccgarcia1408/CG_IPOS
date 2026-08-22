import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import DashboardFilterBar, { DashboardFilters } from "../../components/dashboard/DashboardFilterBar";
import SalesKpiCards from "../../components/dashboard/SalesKpiCards";
import SalesTrendChart from "../../components/dashboard/SalesTrendChart";
import { api } from "../../services/api";
import { SalesSummary, SalesTrendGranularity, SalesTrendPoint } from "../../types/Dashboard";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters | null>(null);
  const [granularity, setGranularity] = useState<SalesTrendGranularity>("DAILY");

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [trend, setTrend] = useState<SalesTrendPoint[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(true);

  const loadSummary = useCallback(async (current: DashboardFilters) => {
    try {
      setLoadingSummary(true);

      const response = await api.get<{ data: SalesSummary }>(
        `/api/dashboard/sales-summary?StartDate=${encodeURIComponent(current.StartDate)}&EndDate=${encodeURIComponent(current.EndDate)}${
          current.BranchId ? `&BranchId=${current.BranchId}` : ""
        }`,
        { auth: true }
      );

      setSummary(response.data ?? null);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load sales summary."), { id: "sales-summary-error" });
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadTrend = useCallback(async (current: DashboardFilters, currentGranularity: SalesTrendGranularity) => {
    try {
      setLoadingTrend(true);

      const response = await api.get<{ data: SalesTrendPoint[] }>(
        `/api/dashboard/sales-trend?StartDate=${encodeURIComponent(current.StartDate)}&EndDate=${encodeURIComponent(current.EndDate)}&Granularity=${currentGranularity}${
          current.BranchId ? `&BranchId=${current.BranchId}` : ""
        }`,
        { auth: true }
      );

      setTrend(response.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load sales trend."), { id: "sales-trend-error" });
    } finally {
      setLoadingTrend(false);
    }
  }, []);

  useEffect(() => {
    if (!filters) return;
    void loadSummary(filters);
  }, [filters, loadSummary]);

  useEffect(() => {
    if (!filters) return;
    void loadTrend(filters, granularity);
  }, [filters, granularity, loadTrend]);

  return (
    <>
      <PageMeta
        title="CG_IPOS | Dashboard"
        description="Welcome to the CG_IPOS Dashboard, your central hub for monitoring and analyzing key performance metrics."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <DashboardFilterBar onChange={setFilters} />
        </div>

        <div className="col-span-12 space-y-6">
          <SalesKpiCards summary={summary} loading={loadingSummary} />

          <SalesTrendChart
            data={trend}
            loading={loadingTrend}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
