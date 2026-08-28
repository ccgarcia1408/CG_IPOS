import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, dateOnly } from "../../utils/reportFormat";
import { RecentPurchase } from "../../types/Dashboard";

const columns: ReportColumn<RecentPurchase>[] = [
  { key: "PurchaseDate", header: "Purchase Date", format: (row) => dateOnly(row.PurchaseDate) },
  { key: "SupplierName", header: "Supplier" },
  { key: "BranchName", header: "Branch" },
  { key: "TotalAmount", header: "Total Amount", align: "right", bold: true, format: (row) => money(row.TotalAmount) },
  { key: "Status", header: "Status" },
];

export default function PurchaseDetailReport() {
  return (
    <GenericReportPage<RecentPurchase>
      title="Purchase Detail"
      breadcrumb="Purchase Detail"
      description="Every purchase order within the selected date range and branch."
      endpoint="recent-purchases"
      columns={columns}
      rowKey={(row) => row.PurchaseId}
      extraParams={{ Limit: "1000" }}
    />
  );
}
