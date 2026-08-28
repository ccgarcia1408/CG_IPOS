import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { OutOfStockAlert } from "../../types/Dashboard";

const columns: ReportColumn<OutOfStockAlert>[] = [
  { key: "ProductName", header: "Product" },
  { key: "SKU", header: "SKU" },
  { key: "BranchName", header: "Branch" },
];

export default function OutOfStockReport() {
  return (
    <GenericReportPage<OutOfStockAlert>
      title="Out of Stock Report"
      breadcrumb="Out of Stock Report"
      description="Products currently at zero stock."
      endpoint="out-of-stock-alerts"
      columns={columns}
      rowKey={(row) => `${row.ProductId}-${row.BranchId}`}
      includeDateRange={false}
      emptyMessage="No products are currently out of stock."
    />
  );
}
