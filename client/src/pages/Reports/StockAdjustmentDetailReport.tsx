import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { dateTime } from "../../utils/reportFormat";
import { RecentStockAdjustment } from "../../types/Dashboard";

const columns: ReportColumn<RecentStockAdjustment>[] = [
  { key: "CreatedAt", header: "Date/Time", format: (row) => dateTime(row.CreatedAt) },
  { key: "ProductName", header: "Product" },
  { key: "BranchName", header: "Branch" },
  { key: "Quantity", header: "Quantity", align: "right", bold: true },
  { key: "Reason", header: "Reason", format: (row) => row.Reason ?? "-" },
  { key: "UserName", header: "Adjusted By", format: (row) => row.UserName ?? "-" },
];

export default function StockAdjustmentDetailReport() {
  return (
    <GenericReportPage<RecentStockAdjustment>
      title="Stock Adjustment Detail"
      breadcrumb="Stock Adjustment Detail"
      description="Every manual stock adjustment within the selected date range and branch."
      endpoint="recent-stock-adjustments"
      columns={columns}
      rowKey={(row) => row.InventoryLogId}
      extraParams={{ Limit: "1000" }}
    />
  );
}
