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

export default function BranchMaintenanceForm() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<{
        success: boolean;
        data: Branch[];
      }>("/api/branches", {
        auth: true,
      });

      setBranches(response.data ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const activeCount = useMemo(
    () => branches.filter((x) => x.IsActive).length,
    [branches]
  );

  const inactiveCount = useMemo(
    () => branches.filter((x) => !x.IsActive).length,
    [branches]
  );

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

  // Search
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

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBranches.length / pageSize)
  );

  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [filteredBranches, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  return (
  <div className="space-y-5">
    {/* Page Header */}
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Branch Maintenance
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage all company branches.
        </p>
      </div>

      <button className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
        + Add Branch
      </button>
    </div>

    {/* Statistics */}
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

    {/* Search */}
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

    {loading && (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        Loading branches...
      </div>
    )}

    {error && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    )}

    {!loading && !error && (
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
                        <button className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                          Edit
                        </button>

                        <button className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">
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

  </div>
);
}