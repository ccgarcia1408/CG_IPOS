import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { InventorySummary } from "../../types/Dashboard";

const columns: ReportColumn<InventorySummary>[] = [
  { key: "TotalActiveProducts", header: "Active Products" },
  { key: "TotalInventoryUnits", header: "Total Units" },
  { key: "TotalInventoryValue", header: "Inventory Value", format: (row) => money(row.TotalInventoryValue) },
  { key: "LowStockCount", header: "Low Stock" },
  { key: "OutOfStockCount", header: "Out of Stock" },
  { key: "ExpiringSoonCount", header: "Expiring Soon" },
];

export default function InventorySummaryReport() {
  return (
    <GenericReportPage<InventorySummary>
      title="Inventory Summary"
      breadcrumb="Inventory Summary"
      description="Current stock position: active products, units on hand, value, and alert counts."
      endpoint="inventory-summary"
      columns={columns}
      rowKey={() => "inventory-summary"}
      kind="summary"
      includeDateRange={false}
    />
  );
}
