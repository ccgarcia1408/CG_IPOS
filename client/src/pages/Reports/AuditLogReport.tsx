import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { dateTime } from "../../utils/reportFormat";
import { RecentActivity } from "../../types/Dashboard";

const columns: ReportColumn<RecentActivity>[] = [
  { key: "CreatedAt", header: "Date/Time", format: (row) => dateTime(row.CreatedAt) },
  { key: "ActionType", header: "Action Type" },
  { key: "Action", header: "Action" },
  { key: "TableName", header: "Table" },
  { key: "RecordId", header: "Record ID", align: "right", format: (row) => row.RecordId ?? "-" },
  { key: "UserName", header: "User", format: (row) => row.UserName ?? "-" },
];

export default function AuditLogReport() {
  return (
    <GenericReportPage<RecentActivity>
      title="User Activity / Audit Log"
      breadcrumb="Audit Log Report"
      description="System-wide audit trail of create/update/delete actions (Administrator only)."
      endpoint="recent-activity"
      columns={columns}
      rowKey={(row) => row.AuditLogId}
      extraParams={{ Limit: "1000" }}
    />
  );
}
