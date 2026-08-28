import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { OrAssignmentStatus } from "../../types/Dashboard";

const columns: ReportColumn<OrAssignmentStatus>[] = [
  { key: "CashierName", header: "Cashier" },
  { key: "ORFrom", header: "OR From" },
  { key: "ORTo", header: "OR To" },
  { key: "LastORUsed", header: "Last OR Used", format: (row) => row.LastORUsed ?? "-" },
  { key: "RemainingCount", header: "Remaining", align: "right", bold: true },
];

export default function OrAssignmentStatusReport() {
  return (
    <GenericReportPage<OrAssignmentStatus>
      title="OR Assignment Status"
      breadcrumb="OR Assignment Status"
      description="Official receipt booklet assignments per cashier and how many numbers remain."
      endpoint="or-assignment-status"
      columns={columns}
      rowKey={(row) => row.ORAssignmentId}
      includeDateRange={false}
      emptyMessage="No OR assignments found."
    />
  );
}
