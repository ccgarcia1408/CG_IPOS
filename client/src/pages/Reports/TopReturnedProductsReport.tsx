import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { TopReturnedProduct } from "../../types/Dashboard";

const columns: ReportColumn<TopReturnedProduct>[] = [
  { key: "ProductName", header: "Product" },
  { key: "SKU", header: "SKU" },
  { key: "QuantityReturned", header: "Quantity Returned", align: "right" },
  { key: "ReturnValue", header: "Return Value", align: "right", bold: true, format: (row) => money(row.ReturnValue) },
];

export default function TopReturnedProductsReport() {
  return (
    <GenericReportPage<TopReturnedProduct>
      title="Top Returned Products"
      breadcrumb="Top Returned Products"
      description="Products most frequently returned within the selected date range and branch."
      endpoint="top-returned-products"
      columns={columns}
      rowKey={(row) => row.ProductId}
      extraParams={{ Limit: "1000" }}
    />
  );
}
