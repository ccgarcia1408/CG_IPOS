import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { CashierPerformance } from "../../types/Dashboard";

const columns: ReportColumn<CashierPerformance>[] = [
  { key: "CashierName", header: "Cashier" },
  { key: "BranchName", header: "Branch" },
  { key: "Transactions", header: "Transactions", align: "right" },
  { key: "Sales", header: "Sales", align: "right", bold: true, format: (row) => money(row.Sales) },
  { key: "ItemsSold", header: "Items Sold", align: "right" },
  { key: "AverageTransactionValue", header: "Avg. Transaction Value", align: "right", format: (row) => money(row.AverageTransactionValue) },
];

export default function CashierPerformanceReport() {
  return (
    <GenericReportPage<CashierPerformance>
      title="Cashier Performance"
      breadcrumb="Cashier Performance"
      description="Sales performance per cashier for the selected date range and branch."
      endpoint="cashier-performance"
      columns={columns}
      rowKey={(row) => row.CashierId}
    />
  );
}
