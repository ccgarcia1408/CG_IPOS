import { useState } from "react";
import GenericReportPage from "../../components/reports/GenericReportPage";
import SearchableSelect from "../../components/form/SearchableSelect";
import { ReportColumn } from "../../utils/reportExport";
import { money, percent } from "../../utils/reportFormat";
import { TopProduct, TopProductsSortBy } from "../../types/Dashboard";

const columns: ReportColumn<TopProduct>[] = [
  { key: "Rank", header: "Rank", align: "right" },
  { key: "ProductName", header: "Product" },
  { key: "SKU", header: "SKU" },
  { key: "CategoryName", header: "Category" },
  { key: "QuantitySold", header: "Quantity Sold", align: "right" },
  { key: "SalesAmount", header: "Sales Amount", align: "right", bold: true, format: (row) => money(row.SalesAmount) },
  { key: "PercentageOfSales", header: "% of Sales", align: "right", format: (row) => percent(row.PercentageOfSales) },
];

const SORT_OPTIONS = [
  { value: "REVENUE", label: "By Revenue" },
  { value: "QUANTITY", label: "By Quantity" },
];

export default function TopProductsReport() {
  const [sortBy, setSortBy] = useState<TopProductsSortBy>("REVENUE");

  return (
    <GenericReportPage<TopProduct>
      title="Top-Selling Products"
      breadcrumb="Top-Selling Products"
      description="Best-performing products for the selected date range and branch."
      endpoint="top-products"
      columns={columns}
      rowKey={(row) => row.ProductId}
      extraParams={{ SortBy: sortBy, Limit: "1000" }}
      extraControl={() => (
        <div className="w-44">
          <SearchableSelect
            placeholder="Sort by"
            value={sortBy}
            onChange={(value) => setSortBy(value as TopProductsSortBy)}
            options={SORT_OPTIONS}
          />
        </div>
      )}
    />
  );
}
