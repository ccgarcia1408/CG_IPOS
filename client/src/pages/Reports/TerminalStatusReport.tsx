import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { dateTime } from "../../utils/reportFormat";
import { TerminalStatus } from "../../types/Dashboard";

const columns: ReportColumn<TerminalStatus>[] = [
  { key: "TerminalName", header: "Terminal" },
  { key: "BranchName", header: "Branch" },
  { key: "Status", header: "Status", bold: true },
  { key: "CurrentCashierName", header: "Current Cashier", format: (row) => row.CurrentCashierName ?? "-" },
  { key: "ShiftOpenedAt", header: "Shift Opened At", format: (row) => dateTime(row.ShiftOpenedAt) },
];

export default function TerminalStatusReport() {
  return (
    <GenericReportPage<TerminalStatus>
      title="Terminal Status"
      breadcrumb="Terminal Status"
      description="Current open/closed status of every POS terminal."
      endpoint="terminal-status"
      columns={columns}
      rowKey={(row) => row.TerminalId}
      includeDateRange={false}
    />
  );
}
