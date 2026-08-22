import { Link } from "react-router-dom";
import {
  PlusIcon,
  BoxCubeIcon,
  DownloadIcon,
  TaskIcon,
  GroupIcon,
  TimeIcon,
  ListIcon,
} from "../../icons";

interface QuickActionsCardProps {
  isCashier: boolean;
}

type QuickAction = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

// "Stock Transfer" and "Reports" from the ticket's recommended action list are omitted --
// neither exists as a real feature/page in this app yet, and this panel only links to real
// destinations.
const MANAGER_ACTIONS: QuickAction[] = [
  { label: "New Sale", to: "/pos", icon: PlusIcon },
  { label: "Add Product", to: "/products", icon: BoxCubeIcon },
  { label: "New Purchase", to: "/purchasing", icon: DownloadIcon },
  { label: "Receive Stock", to: "/purchasing", icon: TaskIcon },
  { label: "Stock Adjustment", to: "/inventory", icon: ListIcon },
  { label: "Add Supplier", to: "/supplier-maintenance", icon: GroupIcon },
  { label: "Open Cashier Shift", to: "/pos", icon: TimeIcon },
];

const CASHIER_ACTIONS: QuickAction[] = [
  { label: "New Sale", to: "/pos", icon: PlusIcon },
  { label: "Open / Close Shift", to: "/pos", icon: TimeIcon },
  { label: "View Current Sales", to: "/sales-history", icon: ListIcon },
];

export default function QuickActionsCard({ isCashier }: QuickActionsCardProps) {
  const actions = isCashier ? CASHIER_ACTIONS : MANAGER_ACTIONS;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:hover:border-brand-500/30 dark:hover:bg-white/5"
          >
            <action.icon className="size-6 text-brand-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
