import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money } from "../../utils/reportFormat";
import { ReturnReason } from "../../types/Dashboard";

const columns: ReportColumn<ReturnReason>[] = [
  { key: "Reason", header: "Reason" },
  { key: "ReturnCount", header: "Return Count", align: "right" },
  { key: "RefundAmount", header: "Refund Amount", align: "right", bold: true, format: (row) => money(row.RefundAmount) },
];

export default function ReturnReasonsReport() {
  return (
    <GenericReportPage<ReturnReason>
      title="Return Reasons"
      breadcrumb="Return Reasons"
      description="Returns grouped by reason, with count and refunded amount."
      endpoint="return-reasons"
      columns={columns}
      rowKey={(row) => row.Reason}
    />
  );
}
