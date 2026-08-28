import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, dateTime } from "../../utils/reportFormat";
import { VoidedSale } from "../../types/Dashboard";

const columns: ReportColumn<VoidedSale>[] = [
  { key: "ORNo", header: "OR No.", format: (row) => row.ORNo ?? "-" },
  { key: "BranchName", header: "Branch" },
  { key: "TerminalName", header: "Terminal" },
  { key: "CashierName", header: "Cashier", format: (row) => row.CashierName ?? "-" },
  { key: "Total", header: "Total", align: "right", bold: true, format: (row) => money(row.Total) },
  { key: "CancelReason", header: "Reason", format: (row) => row.CancelReason ?? "-" },
  { key: "DateCancelled", header: "Voided At", format: (row) => dateTime(row.DateCancelled) },
];

export default function VoidedSalesReport() {
  return (
    <GenericReportPage<VoidedSale>
      title="Voided Sales"
      breadcrumb="Voided Sales"
      description="Every sale voided within the selected date range and branch, with reason and value."
      endpoint="voided-sales"
      columns={columns}
      rowKey={(row) => row.SaleId}
    />
  );
}
