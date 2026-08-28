import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { SalesByTerminal } from "../../types/Dashboard";

const columns: ReportColumn<SalesByTerminal>[] = [
  { key: "TerminalName", header: "Terminal" },
  { key: "BranchName", header: "Branch" },
  { key: "Sales", header: "Sales", align: "right", bold: true, format: (row) => money(row.Sales) },
  { key: "Transactions", header: "Transactions", align: "right" },
  { key: "ItemsSold", header: "Items Sold", align: "right" },
  { key: "AverageTransactionValue", header: "Avg. Transaction Value", align: "right", format: (row) => money(row.AverageTransactionValue) },
];

export default function SalesByTerminalReport() {
  return (
    <GenericReportPage<SalesByTerminal>
      title="Sales by Terminal"
      breadcrumb="Sales by Terminal"
      description="Sales performance compared across POS terminals."
      endpoint="sales-by-terminal"
      columns={columns}
      rowKey={(row) => row.TerminalId}
    />
  );
}
