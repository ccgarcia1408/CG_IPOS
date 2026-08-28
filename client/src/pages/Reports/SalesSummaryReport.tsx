import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { SalesSummary } from "../../types/Dashboard";

const columns: ReportColumn<SalesSummary>[] = [
  { key: "GrossSales", header: "Gross Sales", format: (row) => money(row.GrossSales.Current) },
  { key: "NetSales", header: "Net Sales", format: (row) => money(row.NetSales.Current) },
  { key: "CompletedTransactions", header: "Completed Transactions", format: (row) => row.CompletedTransactions.Current },
  { key: "ItemsSold", header: "Items Sold", format: (row) => row.ItemsSold.Current },
  { key: "AverageTransactionValue", header: "Average Transaction Value", format: (row) => money(row.AverageTransactionValue.Current) },
  { key: "TotalDiscounts", header: "Total Discounts", format: (row) => money(row.TotalDiscounts.Current) },
  { key: "TotalReturns", header: "Total Returns", format: (row) => money(row.TotalReturns.Current) },
  { key: "ReturnsCount", header: "Returns Count", format: (row) => row.ReturnsCount.Current },
  { key: "VoidedSales", header: "Voided Sales", format: (row) => money(row.VoidedSales.Current) },
  { key: "VoidedCount", header: "Voided Count", format: (row) => row.VoidedCount.Current },
];

export default function SalesSummaryReport() {
  return (
    <GenericReportPage<SalesSummary>
      title="Sales Summary"
      breadcrumb="Sales Summary"
      description="Gross/net sales, transactions, discounts, and returns for the selected date range and branch."
      endpoint="sales-summary"
      columns={columns}
      rowKey={() => "sales-summary"}
      kind="summary"
    />
  );
}
