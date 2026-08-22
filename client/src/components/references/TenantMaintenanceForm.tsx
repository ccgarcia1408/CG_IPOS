import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { api } from "../../services/api";

import { Tenant } from "../../types/Tenant";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;

      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }

  return error instanceof Error ? error.message : fallback;
};

export default function TenantMaintenanceForm() {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // MODAL STATES
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // LOADING
  const [loadingTenants, setLoadingTenants] = useState(true);

  // FORM
  const [form, setForm] = useState({
    Name: "",
    Description: "",
    ContactNo: "",
    Email: "",
    IsActive: "1",
  });

  // SEARCH
  const [search, setSearch] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoadingTenants(true);

      const response = await api.get<{
        success: boolean;
        data: Tenant[];
      }>("/api/tenants", {
        auth: true,
      });

      setTenants(response.data ?? []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load tenants."), {
        id: "tenants-error",
      });
    } finally {
      setLoadingTenants(false);
    }
  };

  const resetForm = () => {
    setForm({
      Name: "",
      Description: "",
      ContactNo: "",
      Email: "",
      IsActive: "1",
    });
  };

  const validateForm = () => {
    if (!form.Name.trim()) {
      toast.error("Tenant name is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await api.post(
        "/api/tenants",
        {
          Name: form.Name.trim(),
          Description: form.Description.trim() || null,
          ContactNo: form.ContactNo.trim() || null,
          Email: form.Email.trim() || null,
        },
        {
          auth: true,
        }
      );

      toast.success("Tenant added successfully.");

      await loadTenants();

      resetForm();
      setEditingTenant(null);
      setIsAddOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add tenant."));
    }
  };

  const handleUpdate = async () => {
    if (!editingTenant) return;

    if (!validateForm()) return;

    try {
      await api.put(
        `/api/tenants/${editingTenant.TenantId}`,
        {
          Name: form.Name.trim(),
          Description: form.Description.trim() || null,
          ContactNo: form.ContactNo.trim() || null,
          Email: form.Email.trim() || null,
          IsActive: Number(form.IsActive),
        },
        {
          auth: true,
        }
      );

      toast.success("Tenant updated successfully.");

      await loadTenants();

      resetForm();
      setEditingTenant(null);
      setIsAddOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update tenant."));
    }
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;

    try {
      await api.delete(`/api/tenants/${deletingTenant.TenantId}`, {
        auth: true,
      });

      toast.success("Tenant deactivated successfully.");

      await loadTenants();

      setDeletingTenant(null);
      resetForm();
      setEditingTenant(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to deactivate tenant."));
    }
  };

  const activeCount = useMemo(
    () => tenants.filter((tenant) => Number(tenant.IsActive) === 1).length,
    [tenants]
  );

  const inactiveCount = useMemo(
    () => tenants.filter((tenant) => Number(tenant.IsActive) !== 1).length,
    [tenants]
  );

  const filteredTenants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tenants;

    return tenants.filter((tenant) =>
      [tenant.Name, tenant.Description, tenant.ContactNo, tenant.Email]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [tenants, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / pageSize));

  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTenants.slice(start, start + pageSize);
  }, [filteredTenants, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Tenant Maintenance</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage tenants (business/organization owners of one or more branches).</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600">+ Add Tenant</button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          ["Total Tenants", tenants.length, ""],
          ["Active", activeCount, "text-green-600"],
          ["Inactive", inactiveCount, "text-red-600"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="relative">
          <input type="text" placeholder="Search tenants..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
          {search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700">Clear</button>}
        </div>
      </div>

      {loadingTenants ? <div>Loading tenants...</div> : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]"><h3 className="font-semibold text-gray-800 dark:text-white">Tenant List</h3></div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30"><TableRow>
                {['Name', 'Description', 'Contact No.', 'Email', 'Status', 'Actions'].map((header) => <TableCell key={header} isHeader>{header}</TableCell>)}
              </TableRow></TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedTenants.length ? paginatedTenants.map((tenant) => {
                  const isActive = Number(tenant.IsActive) === 1;
                  return <TableRow key={tenant.TenantId} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{tenant.Name}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{tenant.Description || "-"}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{tenant.ContactNo || "-"}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{tenant.Email || "-"}</TableCell>
                    <TableCell className="px-5 py-4"><Badge size="sm" color={isActive ? "success" : "error"}>{isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="px-5 py-4"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditingTenant(tenant); setForm({ Name: tenant.Name || '', Description: tenant.Description || '', ContactNo: tenant.ContactNo || '', Email: tenant.Email || '', IsActive: Number(tenant.IsActive) === 1 ? "1" : "0" }); setIsAddOpen(true); }} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">Edit</button>
                      <button onClick={() => setDeletingTenant(tenant)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Delete</button>
                    </div></TableCell>
                  </TableRow>;
                }) : <TableRow><TableCell colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">No tenants found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] md:flex-row">
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filteredTenants.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredTenants.length)} of {filteredTenants.length} {filteredTenants.length === 1 ? 'entry' : 'entries'}</span>
            <div className="flex items-center gap-2"><button onClick={handlePrevious} disabled={currentPage === 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Previous</button>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === index + 1 ? 'bg-brand-500 text-white' : 'border border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5'}`}>{index + 1}</button>)}<button onClick={handleNext} disabled={currentPage === totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Next</button></div>
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
          </div>
        </div>
      )}

      <Modal isOpen={isAddOpen} title={editingTenant ? 'Edit Tenant' : 'Add Tenant'} onClose={() => { setIsAddOpen(false); setEditingTenant(null); resetForm(); }} onConfirm={editingTenant ? handleUpdate : handleSubmit} confirmText={editingTenant ? 'Update Tenant' : 'Save Tenant'} width="xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {([['Name', 'Tenant Name', 'text'], ['ContactNo', 'Contact Number', 'tel'], ['Email', 'Email', 'email']] as const).map(([field, label, type]) => <div key={field}><label className="mb-2 block text-sm font-medium">{label}</label><input type={type} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} /></div>)}
          <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium">Description</label><textarea rows={3} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form.Description} onChange={(event) => setForm((current) => ({ ...current, Description: event.target.value }))} /></div>
          {editingTenant && (
            <div>
              <label className="mb-2 block text-sm font-medium">Active</label>
              <select className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!deletingTenant} title="Deactivate Tenant" onClose={() => setDeletingTenant(null)} onConfirm={handleDelete} confirmText="Deactivate" confirmColor="danger" width="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to deactivate this tenant?</p>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="font-semibold text-red-700 dark:text-red-400">{deletingTenant?.Name}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">It will stay in the list marked Inactive and can be reactivated later from Edit.</p>
        </div>
      </Modal>
    </div>
  );
}
