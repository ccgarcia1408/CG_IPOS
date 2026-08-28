import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { PurchasingSummary } from "../../types/Dashboard";

const columns: ReportColumn<PurchasingSummary>[] = [
  { key: "TotalPurchases", header: "Total Purchases" },
  { key: "PurchaseAmount", header: "Purchase Amount", format: (row) => money(row.PurchaseAmount) },
  { key: "PendingCount", header: "Pending Count" },
  { key: "PendingAmount", header: "Pending Amount", format: (row) => money(row.PendingAmount) },
  { key: "ReceivedCount", header: "Received Count" },
  { key: "ReceivedAmount", header: "Received Amount", format: (row) => money(row.ReceivedAmount) },
  { key: "CancelledCount", header: "Cancelled Count" },
  { key: "CancelledAmount", header: "Cancelled Amount", format: (row) => money(row.CancelledAmount) },
];

export default function PurchasingSummaryReport() {
  return (
    <GenericReportPage<PurchasingSummary>
      title="Purchasing Summary"
      breadcrumb="Purchasing Summary"
      description="Purchase order volume and value, broken down by status, for the selected date range and branch."
      endpoint="purchasing-summary"
      columns={columns}
      rowKey={() => "purchasing-summary"}
      kind="summary"
    />
  );
}
