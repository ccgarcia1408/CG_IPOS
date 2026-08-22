import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { RecentActivity } from "../../types/Dashboard";

interface RecentActivityCardProps {
  data: RecentActivity[];
  loading: boolean;
}

const ACTION_COLOR: Record<string, "success" | "info" | "error" | "light"> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
};

export default function RecentActivityCard({ data, loading }: RecentActivityCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Recent System Activity</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No system activity for the selected filters.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["Date/Time", "User", "Action", "Module", "Reference"].map((h) => (
                  <TableCell key={h} isHeader>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row) => (
                <TableRow key={row.AuditLogId}>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(row.CreatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.UserName ?? "System"}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge size="sm" color={ACTION_COLOR[row.ActionType] ?? "light"}>
                        {row.ActionType}
                      </Badge>
                      <span className="text-gray-700 dark:text-gray-300">{row.Action}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.TableName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.RecordId ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
