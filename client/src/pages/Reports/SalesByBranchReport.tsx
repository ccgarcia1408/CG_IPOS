import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { SalesByBranch } from "../../types/Dashboard";

const columns: ReportColumn<SalesByBranch>[] = [
  { key: "BranchName", header: "Branch" },
  { key: "Sales", header: "Sales", align: "right", bold: true, format: (row) => money(row.Sales) },
  { key: "Transactions", header: "Transactions", align: "right" },
  { key: "ItemsSold", header: "Items Sold", align: "right" },
  { key: "AverageTransactionValue", header: "Avg. Transaction Value", align: "right", format: (row) => money(row.AverageTransactionValue) },
];

export default function SalesByBranchReport() {
  return (
    <GenericReportPage<SalesByBranch>
      title="Sales by Branch"
      breadcrumb="Sales by Branch"
      description="Sales performance compared across branches."
      endpoint="sales-by-branch"
      columns={columns}
      rowKey={(row) => row.BranchId}
    />
  );
}
