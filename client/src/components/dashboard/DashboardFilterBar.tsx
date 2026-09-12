import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SearchableSelect from "../form/SearchableSelect";
import DatePicker from "../form/date-picker";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { decodeJwtPayload } from "../../utils/jwt";
import {
  DATE_RANGE_PRESETS,
  DateRangePreset,
  resolveDateRangePreset,
} from "../../utils/dateRangePresets";
import { Branch } from "../../types/Branch";

const ADMIN_ROLE_ID = 1;

export type DashboardFilters = {
  StartDate: string;
  EndDate: string;
  BranchId: string; // "" = all branches (Admin only)
};

interface DashboardFilterBarProps {
  onChange: (filters: DashboardFilters) => void;
}

const toDateInputValue = (iso: string) => iso.slice(0, 10);

export default function DashboardFilterBar({ onChange }: DashboardFilterBarProps) {
  const { user, token } = useAuth();
  const isAdmin = Number(user?.RoleId) === ADMIN_ROLE_ID;

  const sessionBranchId = useMemo(() => {
    if (isAdmin || !token) return null;
    const payload = decodeJwtPayload<{ BranchId?: number }>(token);
    return payload?.BranchId ?? null;
  }, [isAdmin, token]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [preset, setPreset] = useState<DateRangePreset>("TODAY");
  const [customStart, setCustomStart] = useState(toDateInputValue(new Date().toISOString()));
  const [customEnd, setCustomEnd] = useState(toDateInputValue(new Date().toISOString()));
  const [branchId, setBranchId] = useState(sessionBranchId ? String(sessionBranchId) : "");

  useEffect(() => {
    if (!isAdmin) return;

    api
      .get<{ data: Branch[] }>("/api/branches/active", { auth: true })
      .then((response) => setBranches(response.data ?? []))
      .catch(() => toast.error("Failed to load branches."));
  }, [isAdmin]);

  const sessionBranchName = useMemo(
    () => branches.find((b) => b.BranchId === sessionBranchId)?.Description,
    [branches, sessionBranchId]
  );

  // Non-admins need the branch list too, just to show their own branch's name.
  useEffect(() => {
    if (isAdmin || !sessionBranchId) return;

    api
      .get<{ data: Branch[] }>("/api/branches/active", { auth: true })
      .then((response) => setBranches(response.data ?? []))
      .catch(() => {
        /* Non-fatal: branch name just won't display. */
      });
  }, [isAdmin, sessionBranchId]);

  useEffect(() => {
    const resolved = resolveDateRangePreset(preset);
    const range = resolved ?? {
      startDate: new Date(`${customStart}T00:00:00`).toISOString(),
      endDate: new Date(`${customEnd}T23:59:59`).toISOString(),
    };

    onChange({
      StartDate: range.startDate,
      EndDate: range.endDate,
      BranchId: branchId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customStart, customEnd, branchId]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {DATE_RANGE_PRESETS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPreset(option.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              preset === option.value
                ? "bg-brand-500 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            }`}
          >
            {option.label}
          </button>
        ))}

        {preset === "CUSTOM" && (
          <div className="flex items-center gap-2">
            <div className="w-36">
              <DatePicker
                id="report-filter-custom-start"
                placeholder="Start date"
                defaultDate={customStart}
                onChange={(_dates, dateStr) => setCustomStart(dateStr)}
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
            <div className="w-36">
              <DatePicker
                id="report-filter-custom-end"
                placeholder="End date"
                defaultDate={customEnd}
                onChange={(_dates, dateStr) => setCustomEnd(dateStr)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:w-64">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Branch
        </label>
        {isAdmin ? (
          <SearchableSelect
            placeholder="All branches"
            value={branchId}
            onChange={setBranchId}
            options={branches.map((branch) => ({ value: String(branch.BranchId), label: branch.Description }))}
          />
        ) : (
          <div className="flex w-full items-center rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            {sessionBranchName ?? "Your branch"}
          </div>
        )}
      </div>
    </div>
  );
}
