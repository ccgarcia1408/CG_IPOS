import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Barangay } from "../../types/Barangay";
import { Municipality } from "../../types/Municipality";
import { Province } from "../../types/Province";
import { Supplier } from "../../types/Supplier";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import SearchableSelect from "../form/SearchableSelect";

const emptyForm = {
  SupplierName: "",
  ContactPerson: "",
  ContactNo: "",
  TelNo: "",
  Email: "",
  ProvinceId: "",
  MunicipalityId: "",
  BarangayId: "",
  OtherAddress: "",
  IsActive: "1",
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function SupplierMaintenanceForm() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Supplier[] }>("/api/suppliers", { auth: true });
      setSuppliers(response.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load suppliers."));
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await api.get<{ data: Province[] }>("/api/provinces/active", { auth: true });
      setProvinces(response.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load provinces."));
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadMunicipalities = async (provinceId: string) => {
    if (!provinceId) {
      setMunicipalities([]);
      return;
    }

    try {
      setLoadingMunicipalities(true);
      const response = await api.get<{ data: Municipality[] }>(
        `/api/municipalities/province/${provinceId}`,
        { auth: true },
      );
      setMunicipalities(response.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load municipalities."));
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  const loadBarangays = async (municipalityId: string) => {
    if (!municipalityId) {
      setBarangays([]);
      return;
    }

    try {
      setLoadingBarangays(true);
      const response = await api.get<{ data: Barangay[] }>(
        `/api/barangays/municipality/${municipalityId}`,
        { auth: true },
      );
      setBarangays(response.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load barangays."));
    } finally {
      setLoadingBarangays(false);
    }
  };

  useEffect(() => {
    void load();
    void loadProvinces();
  }, []);

  useEffect(() => {
    void loadMunicipalities(form.ProvinceId);
  }, [form.ProvinceId]);

  useEffect(() => {
    void loadBarangays(form.MunicipalityId);
  }, [form.MunicipalityId]);

  const filtered = useMemo(() => {
    const value = search.toLowerCase().trim();
    return value
      ? suppliers.filter((supplier) =>
          [supplier.SupplierName, supplier.ContactPerson, supplier.ContactNo, supplier.TelNo, supplier.Email, supplier.OtherAddress]
            .filter(Boolean)
            .some((item) => String(item).toLowerCase().includes(value)),
        )
      : suppliers;
  }, [search, suppliers]);

  const activeCount = useMemo(() => suppliers.filter((supplier) => supplier.IsActive).length, [suppliers]);
  const inactiveCount = useMemo(() => suppliers.filter((supplier) => !supplier.IsActive).length, [suppliers]);
  const newCount = useMemo(() => {
    const now = new Date();
    return suppliers.filter((supplier) => { const created = new Date(supplier.CreatedAt); return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear(); }).length;
  }, [suppliers]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePrevious = () => setCurrentPage((current) => Math.max(current - 1, 1));
  const handleNext = () => setCurrentPage((current) => Math.min(current + 1, totalPages));

  const close = () => {
    setIsOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (!form.SupplierName.trim()) return toast.error("Supplier name is required.");

    const payload = {
      ...form,
      SupplierName: form.SupplierName.trim(),
      ContactPerson: form.ContactPerson.trim() || null,
      ContactNo: form.ContactNo.trim() || null,
      TelNo: form.TelNo.trim() || null,
      Email: form.Email.trim() || null,
      ProvinceId: form.ProvinceId ? Number(form.ProvinceId) : null,
      MunicipalityId: form.MunicipalityId ? Number(form.MunicipalityId) : null,
      BarangayId: form.BarangayId ? Number(form.BarangayId) : null,
      OtherAddress: form.OtherAddress.trim() || null,
      IsActive: Number(form.IsActive),
    };

    try {
      if (editing) {
        await api.put(`/api/suppliers/${editing.SupplierId}`, payload, { auth: true });
      } else {
        await api.post("/api/suppliers", payload, { auth: true });
      }
      toast.success(`Supplier ${editing ? "updated" : "added"} successfully.`);
      close();
      await load();
    } catch (error) {
      toast.error(errorMessage(error, `Failed to ${editing ? "update" : "add"} supplier.`));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/api/suppliers/${deleting.SupplierId}`, { auth: true });
      toast.success("Supplier deactivated successfully.");
      setDeleting(null);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete supplier."));
    }
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      SupplierName: supplier.SupplierName,
      ContactPerson: supplier.ContactPerson ?? "",
      ContactNo: supplier.ContactNo ?? "",
      TelNo: supplier.TelNo ?? "",
      Email: supplier.Email ?? "",
      ProvinceId: supplier.ProvinceId ? String(supplier.ProvinceId) : "",
      MunicipalityId: supplier.MunicipalityId ? String(supplier.MunicipalityId) : "",
      BarangayId: supplier.BarangayId ? String(supplier.BarangayId) : "",
      OtherAddress: supplier.OtherAddress ?? "",
      IsActive: supplier.IsActive ? "1" : "0",
    });
    setIsOpen(true);
  };

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
      <div><h2 className="text-xl font-semibold text-gray-800 dark:text-white">Supplier Maintenance</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage supplier contact information.</p></div>
      <button onClick={() => setIsOpen(true)} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Supplier</button>
    </div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">{[["Total Suppliers", suppliers.length, ""], ["Active", activeCount, "text-green-600"], ["Inactive", inactiveCount, "text-red-600"], ["New This Month", newCount, "text-blue-600"]].map(([label, value, color]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p><h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3></div>)}</div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="relative"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search suppliers..." className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />{search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5">Clear</button>}</div></div>
    {loading ? <div className="text-gray-800 dark:text-white">Loading suppliers...</div> : <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="max-w-full overflow-x-auto"><Table><TableHeader className="bg-gray-50 dark:bg-gray-900/30"><TableRow>{["Supplier", "Contact Person", "Contact", "Email", "Status", "Actions"].map((header) => <TableCell key={header} isHeader>{header}</TableCell>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">{paginatedSuppliers.length ? paginatedSuppliers.map((supplier) => <TableRow key={supplier.SupplierId}><TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{supplier.SupplierName}</TableCell><TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{supplier.ContactPerson || "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{supplier.ContactNo || supplier.TelNo || "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{supplier.Email || "-"}</TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={supplier.IsActive ? "success" : "error"}>{supplier.IsActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="px-5 py-4"><div className="flex gap-2"><button onClick={() => openEdit(supplier)} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white">Edit</button><button onClick={() => setDeleting(supplier)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white">Delete</button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">No suppliers found.</TableCell></TableRow>}</TableBody></Table></div><div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] md:flex-row"><span className="text-sm text-gray-500 dark:text-gray-400">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} {filtered.length === 1 ? "entry" : "entries"}</span><div className="flex items-center gap-2"><button onClick={handlePrevious} disabled={currentPage === 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Previous</button>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === index + 1 ? "bg-brand-500 text-white" : "border border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"}`}>{index + 1}</button>)}<button onClick={handleNext} disabled={currentPage === totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Next</button></div><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></div></div>}
    <Modal isOpen={isOpen} title={editing ? "Edit Supplier" : "Add Supplier"} onClose={close} onConfirm={save} confirmText={editing ? "Update Supplier" : "Save Supplier"} width="xl"><div className="grid grid-cols-1 gap-5 md:grid-cols-2">{([['Supplier Name', 'SupplierName', 'text'], ['Contact Person', 'ContactPerson', 'text'], ['Mobile Number', 'ContactNo', 'tel'], ['Telephone Number', 'TelNo', 'tel'], ['Email', 'Email', 'email']] as const).map(([label, field, type]) => <div key={field}><label className="mb-2 block text-sm font-medium">{label}</label><input type={type} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>)}
      <div><label className="mb-2 block text-sm font-medium">Province</label><SearchableSelect placeholder={loadingProvinces ? "Loading provinces..." : "Select Province"} disabled={loadingProvinces} value={form.ProvinceId} onChange={(ProvinceId) => { setMunicipalities([]); setBarangays([]); setForm((current) => ({ ...current, ProvinceId, MunicipalityId: "", BarangayId: "" })); }} options={provinces.map((province) => ({ value: String(province.ProvinceId), label: province.Name }))} /></div>
      <div><label className="mb-2 block text-sm font-medium">Municipality</label><SearchableSelect placeholder={loadingMunicipalities ? "Loading municipalities..." : "Select Municipality"} disabled={!form.ProvinceId || loadingMunicipalities} value={form.MunicipalityId} onChange={(MunicipalityId) => { setBarangays([]); setForm((current) => ({ ...current, MunicipalityId, BarangayId: "" })); }} options={municipalities.map((municipality) => ({ value: String(municipality.MunicipalityId), label: municipality.Name }))} /></div>
      <div><label className="mb-2 block text-sm font-medium">Barangay</label><SearchableSelect placeholder={loadingBarangays ? "Loading barangays..." : "Select Barangay"} disabled={!form.MunicipalityId || loadingBarangays} value={form.BarangayId} onChange={(BarangayId) => setForm((current) => ({ ...current, BarangayId }))} options={barangays.map((barangay) => ({ value: String(barangay.BarangayId), label: barangay.Name }))} /></div>
      <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium">Other Address</label><textarea rows={3} value={form.OtherAddress} onChange={(event) => setForm((current) => ({ ...current, OtherAddress: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>{editing && <div><label className="mb-2 block text-sm font-medium">Active</label><select value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="1">Yes</option><option value="0">No</option></select></div>}</div></Modal>
    <Modal isOpen={!!deleting} title="Deactivate Supplier" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Deactivate" confirmColor="danger" width="sm"><p>Deactivate <strong>{deleting?.SupplierName}</strong>? It can be reactivated later from Edit.</p></Modal>
  </div>;
}
