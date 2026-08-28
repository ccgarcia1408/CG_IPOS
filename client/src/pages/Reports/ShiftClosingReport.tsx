import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, dateTime } from "../../utils/reportFormat";
import { ShiftClosingSummary } from "../../types/Dashboard";

const columns: ReportColumn<ShiftClosingSummary>[] = [
  { key: "CashierName", header: "Cashier" },
  { key: "BranchName", header: "Branch" },
  { key: "TerminalName", header: "Terminal" },
  { key: "OpeningCash", header: "Opening Cash", align: "right", format: (row) => money(row.OpeningCash) },
  { key: "ExpectedCash", header: "Expected Cash", align: "right", format: (row) => money(row.ExpectedCash) },
  { key: "ActualCash", header: "Actual Cash", align: "right", format: (row) => money(row.ActualCash) },
  { key: "Variance", header: "Variance", align: "right", bold: true, format: (row) => money(row.Variance) },
  { key: "OpenedAt", header: "Opened At", format: (row) => dateTime(row.OpenedAt) },
  { key: "ClosedAt", header: "Closed At", format: (row) => dateTime(row.ClosedAt) },
];

export default function ShiftClosingReport() {
  return (
    <GenericReportPage<ShiftClosingSummary>
      title="Shift Closing / Cash Reconciliation"
      breadcrumb="Shift Closing Report"
      description="Closed shifts with opening/expected/actual cash and variance (X/Z report)."
      endpoint="shift-closing-summary"
      columns={columns}
      rowKey={(row) => row.CashierShiftId}
      emptyMessage="No shifts closed in the selected date range."
    />
  );
}
