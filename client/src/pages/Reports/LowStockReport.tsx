import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { LowStockAlert } from "../../types/Dashboard";

const columns: ReportColumn<LowStockAlert>[] = [
  { key: "ProductName", header: "Product" },
  { key: "SKU", header: "SKU" },
  { key: "BranchName", header: "Branch" },
  { key: "CurrentStock", header: "Current Stock", align: "right" },
  { key: "MinimumStock", header: "Minimum Stock", align: "right" },
  { key: "StockDifference", header: "Difference", align: "right", bold: true },
];

export default function LowStockReport() {
  return (
    <GenericReportPage<LowStockAlert>
      title="Low Stock Report"
      breadcrumb="Low Stock Report"
      description="Products currently below their minimum stock threshold."
      endpoint="low-stock-alerts"
      columns={columns}
      rowKey={(row) => `${row.ProductId}-${row.BranchId}`}
      includeDateRange={false}
      emptyMessage="No products are currently low on stock."
    />
  );
}
