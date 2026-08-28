import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { SupplierSummary } from "../../types/Dashboard";

const columns: ReportColumn<SupplierSummary>[] = [
  { key: "SupplierName", header: "Supplier" },
  { key: "PurchaseCount", header: "Purchase Count", align: "right" },
  { key: "TotalAmount", header: "Total Amount", align: "right", bold: true, format: (row) => money(row.TotalAmount) },
];

export default function SupplierSummaryReport() {
  return (
    <GenericReportPage<SupplierSummary>
      title="Supplier Purchase Summary"
      breadcrumb="Supplier Purchase Summary"
      description="Purchase spend per supplier for the selected date range and branch."
      endpoint="supplier-summary"
      columns={columns}
      rowKey={(row) => row.SupplierId}
    />
  );
}
