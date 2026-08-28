import { useState } from "react";
import GenericReportPage from "../../components/reports/GenericReportPage";
import SearchableSelect from "../../components/form/SearchableSelect";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { SalesTrendGranularity, SalesTrendPoint } from "../../types/Dashboard";

const columns: ReportColumn<SalesTrendPoint>[] = [
  { key: "PeriodLabel", header: "Period" },
  { key: "GrossSales", header: "Gross Sales", align: "right", format: (row) => money(row.GrossSales) },
  { key: "NetSales", header: "Net Sales", align: "right", format: (row) => money(row.NetSales) },
  { key: "Transactions", header: "Transactions", align: "right" },
  { key: "ItemsSold", header: "Items Sold", align: "right" },
];

const GRANULARITY_OPTIONS = [
  { value: "HOURLY", label: "Hourly" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

export default function SalesTrendReport() {
  const [granularity, setGranularity] = useState<SalesTrendGranularity>("DAILY");

  return (
    <GenericReportPage<SalesTrendPoint>
      title="Sales Trend"
      breadcrumb="Sales Trend"
      description="Sales performance over time, broken down by the selected granularity."
      endpoint="sales-trend"
      columns={columns}
      rowKey={(row) => row.PeriodStart}
      extraParams={{ Granularity: granularity }}
      extraControl={() => (
        <div className="w-44">
          <SearchableSelect
            placeholder="Granularity"
            value={granularity}
            onChange={(value) => setGranularity(value as SalesTrendGranularity)}
            options={GRANULARITY_OPTIONS}
          />
        </div>
      )}
    />
  );
}
