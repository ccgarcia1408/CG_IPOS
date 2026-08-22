import { Link } from "react-router-dom";
import Badge from "../ui/badge/Badge";
import { MyCashierShift } from "../../types/CashierShift";

interface MyShiftCardProps {
  shift: MyCashierShift | null;
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function MyShiftCard({ shift, loading }: MyShiftCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Current Shift</h3>

      {loading ? (
        <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
      ) : shift ? (
        <div className="space-y-3">
          <Badge color="success">Shift Open</Badge>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Terminal</span>
              <span className="font-medium text-gray-800 dark:text-white">{shift.TerminalName}</span>
            </div>
            <div className="flex justify-between">
              <span>Opened At</span>
              <span className="font-medium text-gray-800 dark:text-white">{new Date(shift.OpenedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Opening Cash</span>
              <span className="font-medium text-gray-800 dark:text-white">{money(shift.OpeningCash)}</span>
            </div>
          </div>
          <Link
            to="/pos"
            className="mt-2 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Go to POS to Close Shift
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">You don't have an open shift.</p>
          <Link
            to="/pos"
            className="inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Open Shift in POS
          </Link>
        </div>
      )}
    </div>
  );
}
