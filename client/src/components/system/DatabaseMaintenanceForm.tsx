import { useEffect, useMemo, useState } from "react";
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

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const filtered = useMemo(() => {
    const value = search.toLowerCase().trim();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

    return backups.filter((backup) => {
      if (value && !backup.Filename.toLowerCase().includes(value)) return false;

      const createdAt = new Date(backup.CreatedAt);
      if (from && createdAt < from) return false;
      if (to && createdAt > to) return false;

      return true;
    });
  }, [backups, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedBackups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFrom, dateTo]);

  const handlePrevious = () => setCurrentPage((current) => Math.max(current - 1, 1));
  const handleNext = () => setCurrentPage((current) => Math.min(current + 1, totalPages));

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
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

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by filename..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5"
              >
                Clear
              </button>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        </div>
        {(search || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            Clear all filters
          </button>
        )}
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
                {paginatedBackups.length ? (
                  paginatedBackups.map((backup) => (
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
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] md:flex-row">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}{" "}
              {filtered.length === 1 ? "entry" : "entries"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium ${
                    currentPage === index + 1
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5"
              >
                Next
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
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
