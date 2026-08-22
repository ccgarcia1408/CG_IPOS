import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { OfficialReceiptAssignment } from "../../types/OfficialReceiptAssignment";
import { User } from "../../types/User";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import SearchableSelect from "../form/SearchableSelect";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const emptyForm = { ORFrom: "", ORTo: "", UserId: "" };
const errorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export default function OfficialReceiptAssignmentForm() {
  const [assignments, setAssignments] = useState<OfficialReceiptAssignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<OfficialReceiptAssignment | null>(null);
  const [deleting, setDeleting] = useState<OfficialReceiptAssignment | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: OfficialReceiptAssignment[] }>("/api/or-assignments", { auth: true });
      setAssignments(response.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load OR assignments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    api.get<{ data: User[] }>("/api/users", { auth: true }).then((r) => setUsers(r.data ?? [])).catch(() => toast.error("Failed to load users."));
  }, []);

  const userLabel = (userId: number) => {
    const found = users.find((u) => u.UserId === userId);
    return found ? `${found.Username} (${[found.FirstName, found.LastName].filter(Boolean).join(" ")})` : `User #${userId}`;
  };

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    return value
      ? assignments.filter((a) => [a.ORFrom, a.ORTo, userLabel(a.UserId)].some((v) => String(v).toLowerCase().includes(value)))
      : assignments;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, assignments, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  const close = () => { setIsOpen(false); setEditing(null); setForm(emptyForm); };

  const save = async () => {
    if (!form.UserId) return toast.error("Please select a cashier.");
    if (!form.ORFrom.trim() || !form.ORTo.trim()) return toast.error("OR From and OR To are required.");

    try {
      if (editing) {
        await api.put(`/api/or-assignments/${editing.ORAssignmentId}`, { ORTo: form.ORTo.trim(), UserId: Number(form.UserId) }, { auth: true });
      } else {
        await api.post("/api/or-assignments", { ORFrom: form.ORFrom.trim(), ORTo: form.ORTo.trim(), UserId: Number(form.UserId) }, { auth: true });
      }
      toast.success(`OR assignment ${editing ? "updated" : "added"} successfully.`);
      close();
      await load();
    } catch (error) {
      toast.error(errorMessage(error, `Failed to ${editing ? "update" : "add"} OR assignment.`));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/api/or-assignments/${deleting.ORAssignmentId}`, { auth: true });
      toast.success("OR assignment removed successfully.");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to remove OR assignment."));
    }
  };

  const openEdit = (assignment: OfficialReceiptAssignment) => {
    setEditing(assignment);
    setForm({ ORFrom: assignment.ORFrom, ORTo: assignment.ORTo, UserId: String(assignment.UserId) });
    setIsOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Official Receipt Assignment</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Assign OR number ranges to cashiers for POS checkout.</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Assignment</button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="relative">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by OR range or cashier..." className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5">
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? <div className="text-gray-800 dark:text-white">Loading assignments...</div> : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                <TableRow>{["OR From", "OR To", "Last Used", "Remaining", "Cashier", "Actions"].map((h) => <TableCell key={h} isHeader>{h}</TableCell>)}</TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginated.length ? paginated.map((a) => {
                  const remaining = Number(a.ORTo) - (a.LastORUsed ? Number(a.LastORUsed) : Number(a.ORFrom) - 1);
                  return (
                    <TableRow key={a.ORAssignmentId}>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{a.ORFrom}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{a.ORTo}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{a.LastORUsed || "—"}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={remaining > 0 ? "success" : "error"}>{remaining}</Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{userLabel(a.UserId)}</TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(a)} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">Edit</button>
                          <button onClick={() => setDeleting(a)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Delete</button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }) : <TableRow><TableCell colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">No OR assignments found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] md:flex-row">
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border px-3 py-2 text-sm disabled:text-gray-400 dark:border-white/10 dark:text-gray-300">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => <button key={i} onClick={() => setCurrentPage(i + 1)} className={`h-9 w-9 rounded-lg text-sm ${currentPage === i + 1 ? "bg-brand-500 text-white" : "border dark:border-white/10 dark:text-gray-300"}`}>{i + 1}</button>)}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border px-3 py-2 text-sm disabled:text-gray-400 dark:border-white/10 dark:text-gray-300">Next</button>
            </div>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300">
              <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
          </div>
        </div>
      )}

      <Modal isOpen={isOpen} title={editing ? "Edit OR Assignment" : "Add OR Assignment"} onClose={close} onConfirm={save} confirmText={editing ? "Update Assignment" : "Save Assignment"} width="md">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">OR From</label>
            <input value={form.ORFrom} disabled={!!editing} onChange={(e) => setForm((c) => ({ ...c, ORFrom: e.target.value }))} placeholder="e.g. 0000001" className="w-full rounded-lg border px-4 py-2 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            {editing && <p className="mt-1 text-xs text-gray-400">OR From cannot change once a range is created — numbers may already have been issued from it.</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">OR To</label>
            <input value={form.ORTo} onChange={(e) => setForm((c) => ({ ...c, ORTo: e.target.value }))} placeholder="e.g. 0001000" className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Cashier</label>
            <SearchableSelect
              placeholder="Select a cashier..."
              value={form.UserId}
              onChange={(v) => setForm((c) => ({ ...c, UserId: v }))}
              options={users.map((u) => ({ value: String(u.UserId), label: `${u.Username} (${[u.FirstName, u.LastName].filter(Boolean).join(" ")})` }))}
            />
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleting} title="Delete OR Assignment" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Delete" confirmColor="danger" width="sm">
        <p className="text-sm text-gray-600 dark:text-gray-300">Remove the OR range {deleting?.ORFrom}–{deleting?.ORTo}? The cashier will no longer be able to check out until a new range is assigned.</p>
      </Modal>
    </div>
  );
}
