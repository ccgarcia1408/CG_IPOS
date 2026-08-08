import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Terminal } from "../../types/Terminal";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const emptyForm = { BranchId: "", Name: "", Description: "", IsActive: "1" };
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export default function TerminalMaintenanceForm() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
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
  const close = () => { setIsOpen(false); setEditing(null); setForm(emptyForm); };
  const save = async () => {
    if (!form.BranchId) return toast.error("Please select a branch.");
    if (!form.Name.trim()) return toast.error("Terminal name is required.");
    const payload = { BranchId: Number(form.BranchId), Name: form.Name.trim(), Description: form.Description.trim() || null, IsActive: Number(form.IsActive) };
    try { if (editing) await api.put(`/api/terminals/${editing.TerminalId}`, payload, { auth: true }); else await api.post("/api/terminals", payload, { auth: true }); toast.success(`Terminal ${editing ? "updated" : "added"} successfully.`); close(); await load(); }
    catch (error) { toast.error(errorMessage(error, `Failed to ${editing ? "update" : "add"} terminal.`)); }
  };
  const remove = async () => { if (!deleting) return; try { await api.delete(`/api/terminals/${deleting.TerminalId}`, { auth: true }); toast.success("Terminal deleted successfully."); setDeleting(null); await load(); } catch (error) { toast.error(errorMessage(error, "Failed to delete terminal.")); } };

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-gray-800">Terminal Maintenance</h2><p className="mt-1 text-sm text-gray-500">Manage POS terminals by branch.</p></div><button onClick={() => setIsOpen(true)} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Terminal</button></div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search terminals..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" /></div>
    {loading ? <div>Loading terminals...</div> : <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="max-w-full overflow-x-auto"><Table><TableHeader className="bg-gray-50"><TableRow>{["Terminal", "Branch", "Description", "Status", "Actions"].map((header) => <TableCell key={header} isHeader className="px-5 py-4 text-start text-xs font-semibold uppercase text-gray-500">{header}</TableCell>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-100">{filtered.length ? filtered.map((terminal) => <TableRow key={terminal.TerminalId}><TableCell className="px-5 py-4 font-medium text-gray-800">{terminal.Name}</TableCell><TableCell className="px-5 py-4 text-gray-600">{branches.find((branch) => branch.BranchId === terminal.BranchId)?.Description ?? "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600">{terminal.Description || "-"}</TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={terminal.IsActive ? "success" : "error"}>{terminal.IsActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="px-5 py-4"><div className="flex gap-2"><button onClick={() => { setEditing(terminal); setForm({ BranchId: String(terminal.BranchId), Name: terminal.Name, Description: terminal.Description ?? "", IsActive: terminal.IsActive ? "1" : "0" }); setIsOpen(true); }} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white">Edit</button><button onClick={() => setDeleting(terminal)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white">Delete</button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-500">No terminals found.</TableCell></TableRow>}</TableBody></Table></div></div>}
    <Modal isOpen={isOpen} title={editing ? "Edit Terminal" : "Add Terminal"} onClose={close} onConfirm={save} confirmText={editing ? "Update Terminal" : "Save Terminal"} width="md"><div className="space-y-5"><div><label className="mb-2 block text-sm font-medium">Branch</label><select value={form.BranchId} onChange={(event) => setForm((current) => ({ ...current, BranchId: event.target.value }))} className="w-full rounded-lg border px-4 py-2"><option value="">Select Branch</option>{branches.map((branch) => <option key={branch.BranchId} value={branch.BranchId}>{branch.Description}</option>)}</select></div><div><label className="mb-2 block text-sm font-medium">Terminal Name</label><input value={form.Name} onChange={(event) => setForm((current) => ({ ...current, Name: event.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div><div><label className="mb-2 block text-sm font-medium">Description</label><textarea rows={3} value={form.Description} onChange={(event) => setForm((current) => ({ ...current, Description: event.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>{editing && <div><label className="mb-2 block text-sm font-medium">Active</label><select value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))} className="w-full rounded-lg border px-4 py-2"><option value="1">Yes</option><option value="0">No</option></select></div>}</div></Modal>
    <Modal isOpen={!!deleting} title="Delete Terminal" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Delete" confirmColor="danger" width="sm"><p>Delete <strong>{deleting?.Name}</strong>?</p></Modal>
  </div>;
}
