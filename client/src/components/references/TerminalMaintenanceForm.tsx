import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Terminal } from "../../types/Terminal";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import SearchableSelect from "../form/SearchableSelect";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const emptyForm = { BranchId: "", Name: "", Description: "", IsActive: "1" };
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export default function TerminalMaintenanceForm() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Terminal | null>(null);
  const [deleting, setDeleting] = useState<Terminal | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const load = async () => {
    try { setLoading(true); const response = await api.get<{ data: Terminal[] }>("/api/terminals", { auth: true }); setTerminals(response.data ?? []); }
    catch (error) { toast.error(errorMessage(error, "Failed to load terminals.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); void api.get<{ data: Branch[] }>("/api/branches/active", { auth: true }).then((response) => setBranches(response.data ?? [])).catch((error: unknown) => toast.error(errorMessage(error, "Failed to load branches."))); }, []);
  const filtered = useMemo(() => { const value = search.toLowerCase().trim(); return value ? terminals.filter((terminal) => [terminal.Name, terminal.Description, branches.find((branch) => branch.BranchId === terminal.BranchId)?.Description].filter(Boolean).some((item) => String(item).toLowerCase().includes(value))) : terminals; }, [branches, search, terminals]);
  const activeCount = useMemo(() => terminals.filter((terminal) => terminal.IsActive).length, [terminals]);
  const inactiveCount = useMemo(() => terminals.filter((terminal) => !terminal.IsActive).length, [terminals]);
  const newCount = useMemo(() => { const now = new Date(); return terminals.filter((terminal) => { const created = new Date(terminal.CreatedAt); return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear(); }).length; }, [terminals]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedTerminals = useMemo(() => { const start = (currentPage - 1) * pageSize; return filtered.slice(start, start + pageSize); }, [currentPage, filtered, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [search]);
  const handlePrevious = () => setCurrentPage((current) => Math.max(current - 1, 1));
  const handleNext = () => setCurrentPage((current) => Math.min(current + 1, totalPages));
  const close = () => { setIsOpen(false); setEditing(null); setForm(emptyForm); };
  const save = async () => {
    if (!form.BranchId) return toast.error("Please select a branch.");
    if (!form.Name.trim()) return toast.error("Terminal name is required.");
    const payload = { BranchId: Number(form.BranchId), Name: form.Name.trim(), Description: form.Description.trim() || null, IsActive: Number(form.IsActive) };
    try { if (editing) await api.put(`/api/terminals/${editing.TerminalId}`, payload, { auth: true }); else await api.post("/api/terminals", payload, { auth: true }); toast.success(`Terminal ${editing ? "updated" : "added"} successfully.`); close(); await load(); }
    catch (error) { toast.error(errorMessage(error, `Failed to ${editing ? "update" : "add"} terminal.`)); }
  };
  const remove = async () => { if (!deleting) return; try { await api.delete(`/api/terminals/${deleting.TerminalId}`, { auth: true }); toast.success("Terminal deactivated successfully."); setDeleting(null); await load(); } catch (error) { toast.error(errorMessage(error, "Failed to deactivate terminal.")); } };

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-gray-800 dark:text-white">Terminal Maintenance</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage POS terminals by branch.</p></div><button onClick={() => setIsOpen(true)} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Terminal</button></div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">{[["Total Terminals", terminals.length, ""], ["Active", activeCount, "text-green-600"], ["Inactive", inactiveCount, "text-red-600"], ["New This Month", newCount, "text-blue-600"]].map(([label, value, color]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p><h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3></div>)}</div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="relative"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search terminals..." className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />{search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5">Clear</button>}</div></div>
    {loading ? <div className="text-gray-800 dark:text-white">Loading terminals...</div> : <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="max-w-full overflow-x-auto"><Table><TableHeader className="bg-gray-50 dark:bg-gray-900/30"><TableRow>{["Terminal", "Branch", "Description", "Status", "Actions"].map((header) => <TableCell key={header} isHeader>{header}</TableCell>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">{paginatedTerminals.length ? paginatedTerminals.map((terminal) => <TableRow key={terminal.TerminalId}><TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{terminal.Name}</TableCell><TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{branches.find((branch) => branch.BranchId === terminal.BranchId)?.Description ?? "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{terminal.Description || "-"}</TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={terminal.IsActive ? "success" : "error"}>{terminal.IsActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="px-5 py-4"><div className="flex gap-2"><button onClick={() => { setEditing(terminal); setForm({ BranchId: String(terminal.BranchId), Name: terminal.Name, Description: terminal.Description ?? "", IsActive: terminal.IsActive ? "1" : "0" }); setIsOpen(true); }} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white">Edit</button><button onClick={() => setDeleting(terminal)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white">Delete</button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">No terminals found.</TableCell></TableRow>}</TableBody></Table></div><div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] md:flex-row"><span className="text-sm text-gray-500 dark:text-gray-400">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} {filtered.length === 1 ? "entry" : "entries"}</span><div className="flex items-center gap-2"><button onClick={handlePrevious} disabled={currentPage === 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Previous</button>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === index + 1 ? "bg-brand-500 text-white" : "border border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"}`}>{index + 1}</button>)}<button onClick={handleNext} disabled={currentPage === totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Next</button></div><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></div></div>}
    <Modal isOpen={isOpen} title={editing ? "Edit Terminal" : "Add Terminal"} onClose={close} onConfirm={save} confirmText={editing ? "Update Terminal" : "Save Terminal"} width="md"><div className="space-y-5"><div><label className="mb-2 block text-sm font-medium">Branch</label><SearchableSelect placeholder="Select Branch" value={form.BranchId} onChange={(v) => setForm((current) => ({ ...current, BranchId: v }))} options={branches.map((branch) => ({ value: String(branch.BranchId), label: branch.Description }))} /></div><div><label className="mb-2 block text-sm font-medium">Terminal Name</label><input value={form.Name} onChange={(event) => setForm((current) => ({ ...current, Name: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" /></div><div><label className="mb-2 block text-sm font-medium">Description</label><textarea rows={3} value={form.Description} onChange={(event) => setForm((current) => ({ ...current, Description: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>{editing && <div><label className="mb-2 block text-sm font-medium">Active</label><select value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="1">Yes</option><option value="0">No</option></select></div>}</div></Modal>
    <Modal isOpen={!!deleting} title="Deactivate Terminal" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Deactivate" confirmColor="danger" width="sm"><p>Deactivate <strong>{deleting?.Name}</strong>? It can be reactivated later from Edit.</p></Modal>
  </div>;
}
