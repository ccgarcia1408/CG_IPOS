import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, dateOnly } from "../../utils/reportFormat";
import { PendingPurchase } from "../../types/Dashboard";

const columns: ReportColumn<PendingPurchase>[] = [
  { key: "SupplierName", header: "Supplier" },
  { key: "BranchName", header: "Branch" },
  { key: "PurchaseDate", header: "Purchase Date", format: (row) => dateOnly(row.PurchaseDate) },
  { key: "TotalAmount", header: "Total Amount", align: "right", bold: true, format: (row) => money(row.TotalAmount) },
  { key: "Status", header: "Status" },
];

export default function PendingPurchasesReport() {
  return (
    <GenericReportPage<PendingPurchase>
      title="Pending Purchases"
      breadcrumb="Pending Purchases"
      description="Purchase orders not yet received or cancelled."
      endpoint="pending-purchases"
      columns={columns}
      rowKey={(row) => row.PurchaseId}
      includeDateRange={false}
      emptyMessage="No pending purchase orders."
    />
  );
}
