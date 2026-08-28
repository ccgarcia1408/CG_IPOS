import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { OfficialReceiptSummary } from "../../types/Dashboard";

const columns: ReportColumn<OfficialReceiptSummary>[] = [
  { key: "IssuedCount", header: "OR Issued" },
  { key: "VoidedCount", header: "OR Voided" },
];

export default function OfficialReceiptSummaryReport() {
  return (
    <GenericReportPage<OfficialReceiptSummary>
      title="Official Receipt Summary"
      breadcrumb="Official Receipt Summary"
      description="Official receipts issued and voided for the selected date range and branch."
      endpoint="official-receipt-summary"
      columns={columns}
      rowKey={() => "or-summary"}
      kind="summary"
    />
  );
}
