import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { StockAdjustmentSummary } from "../../types/Dashboard";

const columns: ReportColumn<StockAdjustmentSummary>[] = [
  { key: "AdjustmentCount", header: "Adjustment Count" },
  { key: "StockAdded", header: "Stock Added" },
  { key: "StockRemoved", header: "Stock Removed" },
];

export default function StockAdjustmentSummaryReport() {
  return (
    <GenericReportPage<StockAdjustmentSummary>
      title="Stock Adjustment Summary"
      breadcrumb="Stock Adjustment Summary"
      description="Manual stock adjustment activity for the selected date range and branch."
      endpoint="stock-adjustment-summary"
      columns={columns}
      rowKey={() => "stock-adjustment-summary"}
      kind="summary"
    />
  );
}
