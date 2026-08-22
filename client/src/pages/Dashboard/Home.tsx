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
import SalesByPaymentMethodCard from "../../components/dashboard/SalesByPaymentMethodCard";
import SalesByBranchCard from "../../components/dashboard/SalesByBranchCard";
import SalesByTerminalCard from "../../components/dashboard/SalesByTerminalCard";
import TopProductsCard from "../../components/dashboard/TopProductsCard";
import TopCategoriesCard from "../../components/dashboard/TopCategoriesCard";
import InventoryKpiCards from "../../components/dashboard/InventoryKpiCards";
import InventoryAlertsCard from "../../components/dashboard/InventoryAlertsCard";
import { api } from "../../services/api";
import {
  ExpiringProduct,
  ExpiringThreshold,
  InventorySummary,
  LowStockAlert,
  OutOfStockAlert,
  SalesByBranch,
  SalesByPaymentMethod,
  SalesByTerminal,
  SalesSummary,
  SalesTrendGranularity,
  SalesTrendPoint,
  TopCategory,
  TopProduct,
  TopProductsSortBy,
} from "../../types/Dashboard";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function buildDashboardUrl(path: string, filters: DashboardFilters, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({
    StartDate: filters.StartDate,
    EndDate: filters.EndDate,
    ...extra,
  });

  if (filters.BranchId) params.set("BranchId", filters.BranchId);

  return `/api/dashboard/${path}?${params.toString()}`;
}

function buildInventoryUrl(path: string, filters: DashboardFilters, extra: Record<string, string> = {}) {
  const params = new URLSearchParams(extra);
  if (filters.BranchId) params.set("BranchId", filters.BranchId);

  const query = params.toString();
  return `/api/dashboard/${path}${query ? `?${query}` : ""}`;
}

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters | null>(null);
  const [granularity, setGranularity] = useState<SalesTrendGranularity>("DAILY");
  const [topProductsSortBy, setTopProductsSortBy] = useState<TopProductsSortBy>("REVENUE");

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [trend, setTrend] = useState<SalesTrendPoint[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(true);

  const [paymentMethods, setPaymentMethods] = useState<SalesByPaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);

  const [byBranch, setByBranch] = useState<SalesByBranch[]>([]);
  const [loadingByBranch, setLoadingByBranch] = useState(true);

  const [byTerminal, setByTerminal] = useState<SalesByTerminal[]>([]);
  const [loadingByTerminal, setLoadingByTerminal] = useState(true);

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);

  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loadingTopCategories, setLoadingTopCategories] = useState(true);

  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [loadingInventorySummary, setLoadingInventorySummary] = useState(true);

  const [lowStock, setLowStock] = useState<LowStockAlert[]>([]);
  const [outOfStock, setOutOfStock] = useState<OutOfStockAlert[]>([]);
  const [expiring, setExpiring] = useState<ExpiringProduct[]>([]);
  const [loadingInventoryAlerts, setLoadingInventoryAlerts] = useState(true);
  const [expiringThreshold, setExpiringThreshold] = useState<ExpiringThreshold>(30);

  const loadSummary = useCallback(async (current: DashboardFilters) => {
    try {
      setLoadingSummary(true);
      const response = await api.get<{ data: SalesSummary }>(buildDashboardUrl("sales-summary", current), { auth: true });
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
        buildDashboardUrl("sales-trend", current, { Granularity: currentGranularity }),
        { auth: true }
      );
      setTrend(response.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load sales trend."), { id: "sales-trend-error" });
    } finally {
      setLoadingTrend(false);
    }
  }, []);

  const loadPaymentMethods = useCallback(async (current: DashboardFilters) => {
    try {
      setLoadingPaymentMethods(true);
      const response = await api.get<{ data: SalesByPaymentMethod[] }>(
        buildDashboardUrl("sales-by-payment-method", current),
        { auth: true }
      );
      setPaymentMethods(response.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load payment method breakdown."), { id: "payment-methods-error" });
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, []);

  const loadByBranch = useCallback(async (current: DashboardFilters) => {
    try {
      setLoadingByBranch(true);
      const response = await api.get<{ data: SalesByBranch[] }>(buildDashboardUrl("sales-by-branch", current), { auth: true });
      setByBranch(response.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load sales by branch."), { id: "sales-by-branch-error" });
    } finally {
      setLoadingByBranch(false);
    }
  }, []);

  const loadByTerminal = useCallback(async (current: DashboardFilters) => {
    try {
      setLoadingByTerminal(true);
      const response = await api.get<{ data: SalesByTerminal[] }>(buildDashboardUrl("sales-by-terminal", current), { auth: true });
      setByTerminal(response.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load sales by terminal."), { id: "sales-by-terminal-error" });
    } finally {
      setLoadingByTerminal(false);
    }
  }, []);

  const loadTopProducts = useCallback(async (current: DashboardFilters, sortBy: TopProductsSortBy) => {
    try {
      setLoadingTopProducts(true);
      const response = await api.get<{ data: TopProduct[] }>(
        buildDashboardUrl("top-products", current, { SortBy: sortBy, Limit: "10" }),
        { auth: true }
      );
      setTopProducts(response.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load top products."), { id: "top-products-error" });
    } finally {
      setLoadingTopProducts(false);
    }
  }, []);

  const loadTopCategories = useCallback(async (current: DashboardFilters) => {
    try {
      setLoadingTopCategories(true);
      const response = await api.get<{ data: TopCategory[] }>(buildDashboardUrl("top-categories", current), { auth: true });
      setTopCategories(response.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load top categories."), { id: "top-categories-error" });
    } finally {
      setLoadingTopCategories(false);
    }
  }, []);

  const loadInventorySummary = useCallback(async (current: DashboardFilters) => {
    try {
      setLoadingInventorySummary(true);
      const response = await api.get<{ data: InventorySummary }>(
        buildInventoryUrl("inventory-summary", current),
        { auth: true }
      );
      setInventorySummary(response.data ?? null);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load inventory summary."), { id: "inventory-summary-error" });
    } finally {
      setLoadingInventorySummary(false);
    }
  }, []);

  const loadInventoryAlerts = useCallback(async (current: DashboardFilters, threshold: ExpiringThreshold) => {
    try {
      setLoadingInventoryAlerts(true);
      const [lowRes, outRes, expRes] = await Promise.all([
        api.get<{ data: LowStockAlert[] }>(buildInventoryUrl("low-stock-alerts", current), { auth: true }),
        api.get<{ data: OutOfStockAlert[] }>(buildInventoryUrl("out-of-stock-alerts", current), { auth: true }),
        api.get<{ data: ExpiringProduct[] }>(
          buildInventoryUrl("expiring-products", current, { ThresholdDays: String(threshold) }),
          { auth: true }
        ),
      ]);
      setLowStock(lowRes.data ?? []);
      setOutOfStock(outRes.data ?? []);
      setExpiring(expRes.data ?? []);
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to load inventory alerts."), { id: "inventory-alerts-error" });
    } finally {
      setLoadingInventoryAlerts(false);
    }
  }, []);

  useEffect(() => {
    if (!filters) return;
    void loadSummary(filters);
    void loadPaymentMethods(filters);
    void loadByBranch(filters);
    void loadByTerminal(filters);
    void loadTopCategories(filters);
  }, [filters, loadSummary, loadPaymentMethods, loadByBranch, loadByTerminal, loadTopCategories]);

  useEffect(() => {
    if (!filters) return;
    void loadTrend(filters, granularity);
  }, [filters, granularity, loadTrend]);

  useEffect(() => {
    if (!filters) return;
    void loadTopProducts(filters, topProductsSortBy);
  }, [filters, topProductsSortBy, loadTopProducts]);

  useEffect(() => {
    if (!filters) return;
    void loadInventorySummary(filters);
  }, [filters, loadInventorySummary]);

  useEffect(() => {
    if (!filters) return;
    void loadInventoryAlerts(filters, expiringThreshold);
  }, [filters, expiringThreshold, loadInventoryAlerts]);

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

        <div className="col-span-12 xl:col-span-7">
          <TopProductsCard
            data={topProducts}
            loading={loadingTopProducts}
            sortBy={topProductsSortBy}
            onSortByChange={setTopProductsSortBy}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <SalesByPaymentMethodCard data={paymentMethods} loading={loadingPaymentMethods} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <TopCategoriesCard data={topCategories} loading={loadingTopCategories} />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <SalesByBranchCard data={byBranch} loading={loadingByBranch} />
        </div>

        <div className="col-span-12">
          <SalesByTerminalCard data={byTerminal} loading={loadingByTerminal} />
        </div>

        <div className="col-span-12">
          <InventoryKpiCards summary={inventorySummary} loading={loadingInventorySummary} />
        </div>

        <div className="col-span-12">
          <InventoryAlertsCard
            lowStock={lowStock}
            outOfStock={outOfStock}
            expiring={expiring}
            loading={loadingInventoryAlerts}
            expiringThreshold={expiringThreshold}
            onExpiringThresholdChange={setExpiringThreshold}
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
