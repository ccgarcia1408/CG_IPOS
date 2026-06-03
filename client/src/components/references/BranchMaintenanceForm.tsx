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

  const activeCount = useMemo(
    () => branches.filter((x) => x.IsActive).length,
    [branches]
  );

  const inactiveCount = useMemo(
    () => branches.filter((x) => !x.IsActive).length,
    [branches]
  );

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
          <h3 className="mt-2 text-2xl font-bold text-green-600">{activeCount}</h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Inactive</p>
          <h3 className="mt-2 text-2xl font-bold text-red-600">{inactiveCount}</h3>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">New This Month</p>
          <h3 className="mt-2 text-2xl font-bold text-blue-600">5</h3>
        </div>
      </div>

      {loading && (
        <div className="p-10 text-center">
          Loading branches...
        </div>
      )}

      {error && (
        <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
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

                {/* <TableCell
                  isHeader
                  className="px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  Manager
                </TableCell> */}

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
              {branches.map((branch) => (
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

                  {/* <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {"Test Manager"}
                  </TableCell> */}

                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {branch.ContactNo}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {branch.Barangay}, {branch.Municipality}, {branch.Province}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <Badge
                      size="sm"
                      color={
                        branch.IsActive == 1
                          ? "success"
                          : "error"
                      }
                    >
                      {branch.IsActive == 1 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                        View
                      </button>

                      <button className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                        Edit
                      </button>

                      <button className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
          <span className="text-sm text-gray-500">
            Showing {branches.length} entr{branches.length === 1 ? "y" : "ies"}
          </span>

          <div className="flex gap-2">
            <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-100">
              Previous
            </button>

            <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}