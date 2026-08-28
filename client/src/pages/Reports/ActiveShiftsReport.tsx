import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, dateTime } from "../../utils/reportFormat";
import { ActiveShift } from "../../types/Dashboard";

const columns: ReportColumn<ActiveShift>[] = [
  { key: "CashierName", header: "Cashier" },
  { key: "BranchName", header: "Branch" },
  { key: "TerminalName", header: "Terminal" },
  { key: "OpeningCash", header: "Opening Cash", align: "right", format: (row) => money(row.OpeningCash) },
  { key: "CurrentSales", header: "Current Sales", align: "right", bold: true, format: (row) => money(row.CurrentSales) },
  { key: "CurrentCashPayments", header: "Cash Payments", align: "right", format: (row) => money(row.CurrentCashPayments) },
  { key: "OpenedAt", header: "Opened At", format: (row) => dateTime(row.OpenedAt) },
];

export default function ActiveShiftsReport() {
  return (
    <GenericReportPage<ActiveShift>
      title="Active Shifts"
      breadcrumb="Active Shifts"
      description="Cashier shifts currently open, with running sales totals."
      endpoint="active-shifts"
      columns={columns}
      rowKey={(row) => row.CashierShiftId}
      includeDateRange={false}
      emptyMessage="No shifts are currently open."
    />
  );
}
