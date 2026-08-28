import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, percent } from "../../utils/reportFormat";
import { TopCategory } from "../../types/Dashboard";

const columns: ReportColumn<TopCategory>[] = [
  { key: "CategoryName", header: "Category" },
  { key: "QuantitySold", header: "Quantity Sold", align: "right" },
  { key: "Sales", header: "Sales", align: "right", bold: true, format: (row) => money(row.Sales) },
  { key: "PercentageOfSales", header: "% of Sales", align: "right", format: (row) => percent(row.PercentageOfSales) },
];

export default function TopCategoriesReport() {
  return (
    <GenericReportPage<TopCategory>
      title="Top-Selling Categories"
      breadcrumb="Top-Selling Categories"
      description="Best-performing product categories for the selected date range and branch."
      endpoint="top-categories"
      columns={columns}
      rowKey={(row, index) => row.CategoryId ?? `uncategorized-${index}`}
    />
  );
}
