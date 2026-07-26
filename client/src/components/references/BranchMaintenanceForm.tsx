import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";

import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Province } from "../../types/Province";
import { Municipality } from "../../types/Municipality";
import { Barangay } from "../../types/Barangay";
import Modal from "../ui/modal/Modal";
import { toast } from "sonner";

export default function BranchMaintenanceForm() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  // MODAL STATES
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  // LOADING STATE
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // FORM STATE
  const [form, setForm] = useState({
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
    loadProvinces();
  }, []);

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

      toast.success("Branch deleted successfully.", {
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
          <p className="text-sm text-gray-500">Total Branches</p>
          <h3 className="mt-2 text-2xl font-bold">{branches.length}</h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Active</p>
          <h3 className="mt-2 text-2xl font-bold text-green-600">
            {activeCount}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Inactive</p>
          <h3 className="mt-2 text-2xl font-bold text-red-600">
            {inactiveCount}
          </h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">New This Month</p>
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
            className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 text-sm"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700"
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
                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Branch Code
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Branch Name
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Contact No.
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Address
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </TableCell>
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

                          <div className="text-xs text-gray-500">
                            Branch Information
                          </div>
                        </div>
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
                      colSpan={6}
                      className="py-10 text-center text-gray-500"
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
            <span className="text-sm text-gray-500">
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
                    ? "cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-300 hover:bg-gray-100"
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
                      : "border border-gray-300 hover:bg-gray-100"
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
                    ? "cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-300 hover:bg-gray-100"
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
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

            {/* Branch Code */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Branch Code
                </label>

                <input
                    className="w-full rounded-lg border px-4 py-2"
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
                    className="w-full rounded-lg border px-4 py-2"
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
                    className="w-full rounded-lg border px-4 py-2"
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

                <select
                    className="w-full rounded-lg border px-4 py-2"
                    value={form.ProvinceId}
                    onChange={(e) => {
                      const provinceId = e.target.value;

                      setMunicipalities([]);
                      setBarangays([]);

                      setForm((prev) => ({
                        ...prev,
                        ProvinceId: provinceId,
                        MunicipalityId: "",
                        BarangayId: "",
                      }));
                    }}
                >
                    <option value="">Select Province</option>

                    {provinces.map((province) => (
                        <option
                            key={province.ProvinceId}
                            value={province.ProvinceId}
                        >
                            {province.Name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Municipality */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Municipality
                </label>

                <select
                    className="w-full rounded-lg border px-4 py-2"
                    value={form.MunicipalityId}
                    onChange={(e) => {
                      const municipalityId = e.target.value;

                      setBarangays([]);

                      setForm((prev) => ({
                        ...prev,
                        MunicipalityId: municipalityId,
                        BarangayId: "",
                      }));
                    }}
                >
                    <option value="">Select Municipality</option>

                    {municipalities.map((municipality) => (
                        <option
                            key={municipality.MunicipalityId}
                            value={municipality.MunicipalityId}
                        >
                            {municipality.Name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Barangay */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Barangay
                </label>

                <select
                    className="w-full rounded-lg border px-4 py-2"
                    value={form.BarangayId}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            BarangayId: e.target.value,
                        })
                    }
                >
                    <option value="">Select Barangay</option>

                    {barangays.map((barangay) => (
                        <option
                            key={barangay.BarangayId}
                            value={barangay.BarangayId}
                        >
                            {barangay.Name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Other Address */}
            <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                    Other Address
                </label>

                <textarea
                    rows={3}
                    className="w-full rounded-lg border px-4 py-2"
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
                  className="w-full rounded-lg border px-4 py-2"
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
        title="Delete Branch"
        onClose={() => setDeletingBranch(null)}
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmColor="danger"
        width="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this branch?
          </p>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="font-semibold text-red-700">
              {deletingBranch?.Description}
            </p>

            <p className="mt-1 text-sm text-red-600">
              Branch Code: {deletingBranch?.Name}
            </p>
          </div>

          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}