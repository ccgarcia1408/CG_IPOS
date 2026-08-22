import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import SearchableSelect from "../form/SearchableSelect";

import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Tenant } from "../../types/Tenant";
import { Province } from "../../types/Province";
import { Municipality } from "../../types/Municipality";
import { Barangay } from "../../types/Barangay";
import Modal from "../ui/modal/Modal";
import { toast } from "sonner";

export default function BranchMaintenanceForm() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  // MODAL STATES
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  // LOADING STATE
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [, setLoadingProvinces] = useState(false);
  const [, setLoadingMunicipalities] = useState(false);
  const [, setLoadingBarangays] = useState(false);

  // FORM STATE
  const [form, setForm] = useState({
    TenantId: "",
    Name: "",
    Description: "",
    ContactNo: "",
    ProvinceId: "",
    MunicipalityId: "",
    BarangayId: "",
    OtherAddress: "",
    IsActive: "1",
  });

  // SEARCH STATE
  const [search, setSearch] = useState("");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadBranches();
    loadTenants();
    loadProvinces();
  }, []);

  // LOAD TENANTS
  const loadTenants = async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: Tenant[];
      }>("/api/tenants/active", {
        auth: true,
      });

      setTenants(response.data ?? []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load tenants.",
        {
          id: "tenants-error",
        }
      );
    }
  };

  // LOAD MUNICIPALITIES WHEN PROVINCE CHANGES
  useEffect(() => {
    if (!form.ProvinceId) {
      setMunicipalities([]);
      return;
    }

    loadMunicipalities(form.ProvinceId);
  }, [form.ProvinceId]);

  // LOAD BARANGAYS WHEN MUNICIPALITY CHANGES
  useEffect(() => {
    if (!form.MunicipalityId) {
      setBarangays([]);
      return;
    }

    loadBarangays(form.MunicipalityId);
  }, [form.MunicipalityId]);

  // LOAD BRANCHES
  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      

      const response = await api.get<{
        success: boolean;
        data: Branch[];
      }>("/api/branches", {
        auth: true,
      });

      setBranches(response.data ?? []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load branches.",
        {
          id: "branches-error",
        }
      );
    } finally {
      setLoadingBranches(false);
    }
  };

  // LOAD PROVINCES
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);

      const response = await api.get<{
        success: boolean;
        data: Province[];
      }>("/api/provinces/active", {
        auth: true,
      });

      setProvinces(response.data ?? []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load provinces.",
        {
          id: "provinces-error",
        }
      );
    } finally {
      setLoadingProvinces(false);
    }
  };

  // LOAD MUNICIPALITIES
  const loadMunicipalities = async (provinceId: string) => {
    if (!provinceId) {
      setMunicipalities([]);
      return;
    }

    setLoadingMunicipalities(true);
    try {
      const response = await api.get<{
        success: boolean;
        data: Municipality[];
      }>(`/api/municipalities/province/${provinceId}`, {
        auth: true,
      });

      setMunicipalities(response.data ?? []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load municipalities.",
        {
          id: "municipalities-error",
        }
      );
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  // LOAD BARANGAYS
  const loadBarangays = async (municipalityId: string) => {
    if (!municipalityId) {
      setBarangays([]);
      return;
    }

    setLoadingBarangays(true);
    
    try {
      const response = await api.get<{
        success: boolean;
        data: Barangay[];
      }>(`/api/barangays/municipality/${municipalityId}`, {
        auth: true,
      });

      setBarangays(response.data ?? []);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load barangays.",
        {
          id: "barangays-error",
        }
      );
    } finally {
      setLoadingBarangays(false);
    }
  };

  // ACTIVE COUNT
  const activeCount = useMemo(
    () => branches.filter((x) => x.IsActive).length,
    [branches]
  );

  // INACTIVE COUNT
  const inactiveCount = useMemo(
    () => branches.filter((x) => !x.IsActive).length,
    [branches]
  );

  // LATEST THIS MONTH COUNT
  const latestThisMonth = useMemo(() => {
    const now = new Date();

    return branches
      .filter((branch) => {
        const created = new Date(branch.CreatedAt);

        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      })
      .sort(
        (a, b) =>
          new Date(b.CreatedAt).getTime() -
          new Date(a.CreatedAt).getTime()
      )
      .slice(0, 5);
  }, [branches]);

  const latestThisMonthCount = latestThisMonth.length;

  // SEARCH 
  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return branches;

    return branches.filter((branch) => {
      const address = [
        branch.Barangay,
        branch.Municipality,
        branch.Province,
      ]
        .filter(
          (value): value is string =>
            value != null && value.trim() !== ""
        )
        .join(", ");

      return [
        branch.Name,
        branch.Description,
        branch.ContactNo,
        address,
      ]
        .filter(
          (value): value is string =>
            value != null && value.trim() !== ""
        )
        .some((value) =>
          value.toLowerCase().includes(keyword)
        );
    });
  }, [branches, search]);

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBranches.length / pageSize)
  );

  // PAGINATION
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [filteredBranches, currentPage]);

  // PAGINATION
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // PAGINATION
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // PAGINATION
  const handleNext = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  // RESET FORM
  const resetForm = () => {
    setForm({
      TenantId: "",
      Name: "",
      Description: "",
      ContactNo: "",
      ProvinceId: "",
      MunicipalityId: "",
      BarangayId: "",
      OtherAddress: "",
      IsActive: "1",
    });

    setMunicipalities([]);
    setBarangays([]);
  };

  // VALIDATE FORM
  const validateForm = () => {
    if (!form.TenantId) {
      toast.error("Please select a tenant.", {
        id: "branch-tenant",
      });
      return false;
    }

    if (!form.Name.trim()) {
      toast.error("Branch Code is required.", {
        id: "branch-code",
      });
      return false;
    }

    if (!form.Description.trim()) {
      toast.error("Branch Name is required.", {
        id: "branch-name",
      });
      return false;
    }

    if (!form.ContactNo.trim()) {
      toast.error("Contact Number is required.", {
        id: "branch-contact",
      });
      return false;
    }

    if (!form.ProvinceId) {
      toast.error("Please select a province.", {
        id: "branch-province",
      });
      return false;
    }

    if (!form.MunicipalityId) {
      toast.error("Please select a municipality.", {
        id: "branch-municipality",
      });
      return false;
    }

    if (!form.BarangayId) {
      toast.error("Please select a barangay.", {
        id: "branch-barangay",
      });
      return false;
    }

    return true;
  };

  // HANDLE SUBMIT
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await api.post(
        "/api/branches",
        form,
        {
          auth: true,
        }
      );
      
      await loadBranches();

      resetForm();
      setEditingBranch(null);
      setIsAddOpen(false);

      toast.success("Branch added successfully.", {
        id: "branch-success",
      });
      
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add branch.",
        {
          id: "branch-error",
        }
      );
    }
  };

  // HANDLE UPDATE
  const handleUpdate = async () => {
    if (!editingBranch) return;

    if (!validateForm()) return;

    try {
      await api.put(
        `/api/branches/${editingBranch.BranchId}`,
        {
          ...form,
          IsActive: Number(form.IsActive),
        },
        {
          auth: true,
        }
      );

      toast.success("Branch updated successfully.", {
        id: "branch-success",
      });

      await loadBranches();

      resetForm();
      setEditingBranch(null);
      setIsAddOpen(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update branch.",
        {
          id: "branch-error",
        }
      );
    }
  };

  // HANDLE DELETE
  const handleDelete = async () => {
    if (!deletingBranch) return;

    try {
      await api.delete(
        `/api/branches/${deletingBranch.BranchId}`,
        {
          auth: true,
        }
      );

      toast.success("Branch deactivated successfully.", {
        id: "branch-success",
      });

      await loadBranches();

      setDeletingBranch(null);
      resetForm();
      setEditingBranch(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete branch.",
        {
          id: "branch-error",
        }
      );
    }
  };

  return (
    <div className="space-y-5">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Branch Maintenance
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all company branches.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
          + Add Branch
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Branches</p>
          <h3 className="mt-2 text-2xl font-bold">{branches.length}</h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          <h3 className="mt-2 text-2xl font-bold text-green-600">
            {activeCount}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
          <h3 className="mt-2 text-2xl font-bold text-red-600">
            {inactiveCount}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">New This Month</p>
          <h3 className="mt-2 text-2xl font-bold text-blue-600">
            {latestThisMonthCount}
          </h3>
        </div>
      </div>

      {/* SEARCH */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
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
      </div>

      {/* BRANCH TABLE */}
      {loadingBranches ? (
        <div>Loading branches...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Branch List
            </h3>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                <TableRow>
                  <TableCell isHeader>Branch Code</TableCell>
                  <TableCell isHeader>Branch Name</TableCell>
                  <TableCell isHeader>Tenant</TableCell>
                  <TableCell isHeader>Contact No.</TableCell>
                  <TableCell isHeader>Address</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedBranches.length > 0 ? (
                  paginatedBranches.map((branch) => (
                    <TableRow
                      key={branch.BranchId}
                      className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">
                        {branch.Name}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {branch.Description}
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Branch Information
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {branch.TenantName}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {branch.ContactNo}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {[branch.Barangay, branch.Municipality, branch.Province]
                          .filter(
                            (value): value is string =>
                              value != null && value.trim() !== ""
                          )
                          .join(", ")}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={branch.IsActive ? "success" : "error"}
                        >
                          {branch.IsActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingBranch(branch);

                              setForm({
                                TenantId: String(branch.TenantId),
                                Name: branch.Name,
                                Description: branch.Description,
                                ContactNo: branch.ContactNo,
                                ProvinceId: String(branch.ProvinceId),
                                MunicipalityId: String(branch.MunicipalityId),
                                BarangayId: String(branch.BarangayId),
                                OtherAddress: branch.OtherAddress ?? "",
                                IsActive: branch.IsActive ? "1" : "0",
                              });

                              setIsAddOpen(true);
                            }}
                            className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                            Edit
                          </button>

                          <button 
                            onClick={() => {
                              setDeletingBranch(branch);
                            }}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-gray-500 dark:text-gray-400"
                    >
                      No branches found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] md:flex-row">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              {filteredBranches.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}{" "}
              to{" "}
              {Math.min(currentPage * pageSize, filteredBranches.length)}{" "}
              of {filteredBranches.length} entr
              {filteredBranches.length === 1 ? "y" : "ies"}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  currentPage === 1
                    ? "cursor-not-allowed border-gray-200 text-gray-400 dark:border-white/5 dark:text-gray-500"
                    : "border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
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
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  currentPage === totalPages
                    ? "cursor-not-allowed border-gray-200 text-gray-400 dark:border-white/5 dark:text-gray-500"
                    : "border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                Next
              </button>
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
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

      {/* ADD / EDIT BRANCH */}
      <Modal
        isOpen={isAddOpen}
        title={editingBranch ? "Edit Branch" : "Add Branch"}
        onClose={() => {
          setIsAddOpen(false);
          setEditingBranch(null);
          resetForm();
        }}
        onConfirm={editingBranch ? handleUpdate : handleSubmit}
        confirmText={editingBranch ? "Update Branch" : "Save Branch"}
        width="xl"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Tenant */}
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                    Tenant
                </label>

                <SearchableSelect
                    placeholder="Select Tenant"
                    value={form.TenantId}
                    onChange={(tenantId) =>
                        setForm({
                            ...form,
                            TenantId: tenantId,
                        })
                    }
                    options={tenants.map((tenant) => ({ value: String(tenant.TenantId), label: tenant.Name }))}
                />
            </div>

            {/* Branch Code */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Branch Code
                </label>

                <input
                    className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    value={form.Name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            Name: e.target.value,
                        })
                    }
                />
            </div>

            {/* Branch Name */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Branch Name
                </label>

                <input
                    className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    value={form.Description}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            Description: e.target.value,
                        })
                    }
                />
            </div>

            {/* Contact */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Contact Number
                </label>

                <input
                    className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    value={form.ContactNo}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            ContactNo: e.target.value,
                        })
                    }
                />
            </div>

            {/* Province */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Province
                </label>

                <SearchableSelect
                    placeholder="Select Province"
                    value={form.ProvinceId}
                    onChange={(provinceId) => {
                      setMunicipalities([]);
                      setBarangays([]);

                      setForm((prev) => ({
                        ...prev,
                        ProvinceId: provinceId,
                        MunicipalityId: "",
                        BarangayId: "",
                      }));
                    }}
                    options={provinces.map((province) => ({ value: String(province.ProvinceId), label: province.Name }))}
                />
            </div>

            {/* Municipality */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Municipality
                </label>

                <SearchableSelect
                    placeholder="Select Municipality"
                    disabled={!form.ProvinceId}
                    value={form.MunicipalityId}
                    onChange={(municipalityId) => {
                      setBarangays([]);

                      setForm((prev) => ({
                        ...prev,
                        MunicipalityId: municipalityId,
                        BarangayId: "",
                      }));
                    }}
                    options={municipalities.map((municipality) => ({ value: String(municipality.MunicipalityId), label: municipality.Name }))}
                />
            </div>

            {/* Barangay */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Barangay
                </label>

                <SearchableSelect
                    placeholder="Select Barangay"
                    disabled={!form.MunicipalityId}
                    value={form.BarangayId}
                    onChange={(barangayId) =>
                        setForm({
                            ...form,
                            BarangayId: barangayId,
                        })
                    }
                    options={barangays.map((barangay) => ({ value: String(barangay.BarangayId), label: barangay.Name }))}
                />
            </div>

            {/* Other Address */}
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                    Other Address
                </label>

                <textarea
                    rows={3}
                    className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    value={form.OtherAddress}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            OtherAddress: e.target.value,
                        })
                    }
                />
            </div>

            {/* Status */}
            {editingBranch && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Active
                </label>

                <select
                  className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  value={form.IsActive}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      IsActive: e.target.value,
                    })
                  }
                >
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            )}
        </div>
      </Modal>

      {/* DELETE BRANCH */}
      <Modal
        isOpen={!!deletingBranch}
        title="Deactivate Branch"
        onClose={() => setDeletingBranch(null)}
        onConfirm={handleDelete}
        confirmText="Deactivate"
        confirmColor="danger"
        width="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to deactivate this branch?
          </p>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="font-semibold text-red-700 dark:text-red-400">
              {deletingBranch?.Description}
            </p>

            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Branch Code: {deletingBranch?.Name}
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            It will stay in the list marked Inactive and can be reactivated later from Edit.
          </p>
        </div>
      </Modal>
    </div>
  );
}
