import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, dateTime } from "../../utils/reportFormat";
import { RecentSale } from "../../types/Dashboard";

const columns: ReportColumn<RecentSale>[] = [
  { key: "ORNo", header: "OR No.", format: (row) => row.ORNo ?? "-" },
  { key: "CreatedAt", header: "Date/Time", format: (row) => dateTime(row.CreatedAt) },
  { key: "BranchName", header: "Branch" },
  { key: "TerminalName", header: "Terminal" },
  { key: "CashierName", header: "Cashier", format: (row) => row.CashierName ?? "-" },
  { key: "PaymentMethodName", header: "Payment Method", format: (row) => row.PaymentMethodName ?? "-" },
  { key: "Total", header: "Total", align: "right", bold: true, format: (row) => money(row.Total) },
  { key: "Status", header: "Status" },
];

export default function SalesDetailReport() {
  return (
    <GenericReportPage<RecentSale>
      title="Sales Detail"
      breadcrumb="Sales Detail"
      description="Every sales transaction within the selected date range and branch."
      endpoint="recent-sales"
      columns={columns}
      rowKey={(row) => row.SaleId}
      extraParams={{ Limit: "1000" }}
    />
  );
}
