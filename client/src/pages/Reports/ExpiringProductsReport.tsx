import { useState } from "react";
import GenericReportPage from "../../components/reports/GenericReportPage";
import SearchableSelect from "../../components/form/SearchableSelect";
import { ReportColumn } from "../../utils/reportExport";
import { dateOnly } from "../../utils/reportFormat";
import { ExpiringProduct, ExpiringThreshold } from "../../types/Dashboard";

const columns: ReportColumn<ExpiringProduct>[] = [
  { key: "ProductName", header: "Product" },
  { key: "SKU", header: "SKU" },
  { key: "BranchName", header: "Branch" },
  { key: "Quantity", header: "Quantity", align: "right" },
  { key: "ExpiryDate", header: "Expiry Date", format: (row) => dateOnly(row.ExpiryDate) },
  { key: "DaysRemaining", header: "Days Remaining", align: "right", bold: true },
];

const THRESHOLD_OPTIONS = [
  { value: "7", label: "Within 7 days" },
  { value: "15", label: "Within 15 days" },
  { value: "30", label: "Within 30 days" },
];

export default function ExpiringProductsReport() {
  const [threshold, setThreshold] = useState<ExpiringThreshold>(30);

  return (
    <GenericReportPage<ExpiringProduct>
      title="Expiring Products Report"
      breadcrumb="Expiring Products Report"
      description="Products approaching their expiry date."
      endpoint="expiring-products"
      columns={columns}
      rowKey={(row) => `${row.ProductId}-${row.BranchId}`}
      includeDateRange={false}
      extraParams={{ ThresholdDays: String(threshold) }}
      extraControl={() => (
        <div className="w-48">
          <SearchableSelect
            placeholder="Threshold"
            value={String(threshold)}
            onChange={(value) => setThreshold(Number(value) as ExpiringThreshold)}
            options={THRESHOLD_OPTIONS}
          />
        </div>
      )}
      emptyMessage="No products are expiring within the selected window."
    />
  );
}
