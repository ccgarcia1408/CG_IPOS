import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { DatabaseBackup } from "../../types/DatabaseBackup";
import Modal from "../ui/modal/Modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DatabaseMaintenanceForm() {
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState<DatabaseBackup | null>(null);
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: DatabaseBackup[] }>("/api/database-maintenance", { auth: true });
      setBackups(response.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load backups."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const backupNow = async () => {
    try {
      setBackingUp(true);
      await api.post("/api/database-maintenance/backup", {}, { auth: true });
      toast.success("Backup created successfully.");
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to create backup."));
    } finally {
      setBackingUp(false);
    }
  };

  const restore = async () => {
    if (!restoring) return;
    try {
      setConfirming(true);
      await api.post("/api/database-maintenance/restore", { Filename: restoring.Filename }, { auth: true });
      toast.success("Database restored successfully.");
      setRestoring(null);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to restore backup."));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Database Backups</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Back up the live database, or restore it from a previous backup.
          </p>
        </div>
        <button
          onClick={backupNow}
          disabled={backingUp}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {backingUp ? "Backing up..." : "Backup Now"}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-800 dark:text-white">Loading backups...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                <TableRow>
                  {["Filename", "Size", "Created", "Actions"].map((header) => (
                    <TableCell key={header} isHeader>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {backups.length ? (
                  backups.map((backup) => (
                    <TableRow key={backup.Filename}>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                        {backup.Filename}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {formatSize(backup.SizeBytes)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(backup.CreatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <button
                          onClick={() => setRestoring(backup)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white"
                        >
                          Restore
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-gray-500 dark:text-gray-400">
                      No backups found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!restoring}
        title="Restore Database"
        onClose={() => setRestoring(null)}
        onConfirm={restore}
        confirmText="Restore"
        confirmColor="danger"
        loading={confirming}
        width="sm"
      >
        <p>
          Restoring <strong>{restoring?.Filename}</strong> will overwrite the entire current
          database with this backup. This cannot be undone. A safety backup of the current
          database is taken automatically before the restore proceeds.
        </p>
      </Modal>
    </div>
  );
}
