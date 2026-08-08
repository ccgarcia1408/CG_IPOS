import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Category } from "../../types/Category";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const emptyForm = { BranchId: "", Name: "", Description: "", IsActive: "1" };
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export default function CategoryMaintenanceForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Category[] }>("/api/categories", { auth: true });
      setCategories(response.data ?? []);
    } catch (error: unknown) { toast.error(errorMessage(error, "Failed to load categories.")); }
    finally { setLoading(false); }
  };
  const loadBranches = async () => {
    try {
      const response = await api.get<{ data: Branch[] }>("/api/branches/active", { auth: true });
      setBranches(response.data ?? []);
    } catch (error: unknown) { toast.error(errorMessage(error, "Failed to load branches.")); }
  };
  useEffect(() => { void loadCategories(); void loadBranches(); }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return keyword ? categories.filter((category) => [category.Name, category.Description, branches.find((branch) => branch.BranchId === category.BranchId)?.Description].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword))) : categories;
  }, [categories, branches, search]);
  const activeCount = useMemo(() => categories.filter((category) => category.IsActive).length, [categories]);
  const inactiveCount = useMemo(() => categories.filter((category) => !category.IsActive).length, [categories]);
  const newCount = useMemo(() => { const now = new Date(); return categories.filter((category) => { const created = new Date(category.CreatedAt); return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear(); }).length; }, [categories]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedCategories = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [currentPage, filtered, pageSize]);
  useEffect(() => { setCurrentPage(1); }, [search, pageSize]);
  const close = () => { setIsOpen(false); setEditing(null); setForm(emptyForm); };
  const save = async () => {
    if (!form.BranchId) return toast.error("Please select a branch.");
    if (!form.Name.trim()) return toast.error("Category name is required.");
    const payload = { BranchId: Number(form.BranchId), Name: form.Name.trim(), Description: form.Description.trim() || null, IsActive: Number(form.IsActive) };
    try {
      if (editing) await api.put(`/api/categories/${editing.CategoryId}`, payload, { auth: true });
      else await api.post("/api/categories", payload, { auth: true });
      toast.success(`Category ${editing ? "updated" : "added"} successfully.`); close(); await loadCategories();
    } catch (error: unknown) { toast.error(errorMessage(error, `Failed to ${editing ? "update" : "add"} category.`)); }
  };
  const remove = async () => { if (!deleting) return; try { await api.delete(`/api/categories/${deleting.CategoryId}`, { auth: true }); toast.success("Category deleted successfully."); setDeleting(null); await loadCategories(); } catch (error: unknown) { toast.error(errorMessage(error, "Failed to delete category.")); } };

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-gray-800">Category Maintenance</h2><p className="mt-1 text-sm text-gray-500">Manage product categories by branch.</p></div><button onClick={() => setIsOpen(true)} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Category</button></div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">{[["Total Categories", categories.length, ""], ["Active", activeCount, "text-green-600"], ["Inactive", inactiveCount, "text-red-600"], ["New This Month", newCount, "text-blue-600"]].map(([label, value, color]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><p className="text-sm text-gray-500">{label}</p><h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3></div>)}</div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="relative"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search category..." className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm" />{search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 hover:bg-gray-100">Clear</button>}</div></div>
    {loading ? <div>Loading categories...</div> : <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="border-b border-gray-100 px-5 py-4"><h3 className="font-semibold text-gray-800 dark:text-white">Category List</h3></div><div className="max-w-full overflow-x-auto"><Table><TableHeader className="bg-gray-50 dark:bg-gray-900/30"><TableRow>{["Category", "Branch", "Description", "Status", "Actions"].map((header) => <TableCell key={header} isHeader className={`px-5 py-4 text-xs font-semibold uppercase text-gray-500 ${header === "Actions" ? "text-center" : "text-start"}`}>{header}</TableCell>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-100">{paginatedCategories.length ? paginatedCategories.map((category) => <TableRow key={category.CategoryId}><TableCell className="px-5 py-4 font-medium text-gray-800">{category.Name}</TableCell><TableCell className="px-5 py-4 text-gray-600">{branches.find((branch) => branch.BranchId === category.BranchId)?.Description ?? "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600">{category.Description || "-"}</TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={category.IsActive ? "success" : "error"}>{category.IsActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="px-5 py-4"><div className="flex justify-center gap-2"><button onClick={() => { setEditing(category); setForm({ BranchId: String(category.BranchId), Name: category.Name, Description: category.Description ?? "", IsActive: category.IsActive ? "1" : "0" }); setIsOpen(true); }} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white">Edit</button><button onClick={() => setDeleting(category)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white">Delete</button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-500">No categories found.</TableCell></TableRow>}</TableBody></Table></div><div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 md:flex-row"><span className="text-sm text-gray-500">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries</span><div className="flex items-center gap-2"><button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg border px-3 py-2 text-sm disabled:text-gray-400">Previous</button>{Array.from({ length: totalPages }, (_, index) => <button key={index} onClick={() => setCurrentPage(index + 1)} className={`h-9 w-9 rounded-lg text-sm ${currentPage === index + 1 ? "bg-brand-500 text-white" : "border"}`}>{index + 1}</button>)}<button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-lg border px-3 py-2 text-sm disabled:text-gray-400">Next</button></div><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></div></div>}
    <Modal isOpen={isOpen} title={editing ? "Edit Category" : "Add Category"} onClose={close} onConfirm={save} confirmText={editing ? "Update Category" : "Save Category"} width="md"><div className="space-y-5"><div><label className="mb-2 block text-sm font-medium">Branch</label><select value={form.BranchId} onChange={(event) => setForm((current) => ({ ...current, BranchId: event.target.value }))} className="w-full rounded-lg border px-4 py-2"><option value="">Select Branch</option>{branches.map((branch) => <option key={branch.BranchId} value={branch.BranchId}>{branch.Description}</option>)}</select></div><div><label className="mb-2 block text-sm font-medium">Category Name</label><input value={form.Name} onChange={(event) => setForm((current) => ({ ...current, Name: event.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div><div><label className="mb-2 block text-sm font-medium">Description</label><textarea value={form.Description} onChange={(event) => setForm((current) => ({ ...current, Description: event.target.value }))} className="w-full rounded-lg border px-4 py-2" rows={3} /></div>{editing && <div><label className="mb-2 block text-sm font-medium">Active</label><select value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))} className="w-full rounded-lg border px-4 py-2"><option value="1">Yes</option><option value="0">No</option></select></div>}</div></Modal>
    <Modal isOpen={!!deleting} title="Delete Category" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Delete" confirmColor="danger" width="sm"><p className="text-sm text-gray-600">Are you sure you want to delete <strong>{deleting?.Name}</strong>?</p></Modal>
  </div>;
}
