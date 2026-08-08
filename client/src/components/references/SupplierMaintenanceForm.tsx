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
      toast.success("Supplier deleted successfully.");
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
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div><h2 className="text-xl font-semibold text-gray-800">Supplier Maintenance</h2><p className="mt-1 text-sm text-gray-500">Manage supplier contact information.</p></div>
      <button onClick={() => setIsOpen(true)} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Supplier</button>
    </div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search suppliers..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" /></div>
    {loading ? <div>Loading suppliers...</div> : <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="max-w-full overflow-x-auto"><Table><TableHeader className="bg-gray-50"><TableRow>{["Supplier", "Contact Person", "Contact", "Email", "Status", "Actions"].map((header) => <TableCell key={header} isHeader className="px-5 py-4 text-start text-xs font-semibold uppercase text-gray-500">{header}</TableCell>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-100">{filtered.length ? filtered.map((supplier) => <TableRow key={supplier.SupplierId}><TableCell className="px-5 py-4 font-medium text-gray-800">{supplier.SupplierName}</TableCell><TableCell className="px-5 py-4 text-gray-600">{supplier.ContactPerson || "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600">{supplier.ContactNo || supplier.TelNo || "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600">{supplier.Email || "-"}</TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={supplier.IsActive ? "success" : "error"}>{supplier.IsActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="px-5 py-4"><div className="flex gap-2"><button onClick={() => openEdit(supplier)} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white">Edit</button><button onClick={() => setDeleting(supplier)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white">Delete</button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={6} className="py-10 text-center text-gray-500">No suppliers found.</TableCell></TableRow>}</TableBody></Table></div></div>}
    <Modal isOpen={isOpen} title={editing ? "Edit Supplier" : "Add Supplier"} onClose={close} onConfirm={save} confirmText={editing ? "Update Supplier" : "Save Supplier"} width="xl"><div className="grid grid-cols-1 gap-5 md:grid-cols-2">{([['Supplier Name', 'SupplierName', 'text'], ['Contact Person', 'ContactPerson', 'text'], ['Mobile Number', 'ContactNo', 'tel'], ['Telephone Number', 'TelNo', 'tel'], ['Email', 'Email', 'email']] as const).map(([label, field, type]) => <div key={field}><label className="mb-2 block text-sm font-medium">{label}</label><input type={type} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>)}
      <div><label className="mb-2 block text-sm font-medium">Province</label><select value={form.ProvinceId} onChange={(event) => { const ProvinceId = event.target.value; setMunicipalities([]); setBarangays([]); setForm((current) => ({ ...current, ProvinceId, MunicipalityId: "", BarangayId: "" })); }} disabled={loadingProvinces} className="w-full rounded-lg border px-4 py-2"><option value="">{loadingProvinces ? "Loading provinces..." : "Select Province"}</option>{provinces.map((province) => <option key={province.ProvinceId} value={province.ProvinceId}>{province.Name}</option>)}</select></div>
      <div><label className="mb-2 block text-sm font-medium">Municipality</label><select value={form.MunicipalityId} onChange={(event) => { const MunicipalityId = event.target.value; setBarangays([]); setForm((current) => ({ ...current, MunicipalityId, BarangayId: "" })); }} disabled={!form.ProvinceId || loadingMunicipalities} className="w-full rounded-lg border px-4 py-2"><option value="">{loadingMunicipalities ? "Loading municipalities..." : "Select Municipality"}</option>{municipalities.map((municipality) => <option key={municipality.MunicipalityId} value={municipality.MunicipalityId}>{municipality.Name}</option>)}</select></div>
      <div><label className="mb-2 block text-sm font-medium">Barangay</label><select value={form.BarangayId} onChange={(event) => setForm((current) => ({ ...current, BarangayId: event.target.value }))} disabled={!form.MunicipalityId || loadingBarangays} className="w-full rounded-lg border px-4 py-2"><option value="">{loadingBarangays ? "Loading barangays..." : "Select Barangay"}</option>{barangays.map((barangay) => <option key={barangay.BarangayId} value={barangay.BarangayId}>{barangay.Name}</option>)}</select></div>
      <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium">Other Address</label><textarea rows={3} value={form.OtherAddress} onChange={(event) => setForm((current) => ({ ...current, OtherAddress: event.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>{editing && <div><label className="mb-2 block text-sm font-medium">Active</label><select value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))} className="w-full rounded-lg border px-4 py-2"><option value="1">Yes</option><option value="0">No</option></select></div>}</div></Modal>
    <Modal isOpen={!!deleting} title="Delete Supplier" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Delete" confirmColor="danger" width="sm"><p>Delete <strong>{deleting?.SupplierName}</strong>?</p></Modal>
  </div>;
}
