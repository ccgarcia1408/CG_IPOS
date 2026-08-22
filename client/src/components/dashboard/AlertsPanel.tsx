import { Link } from "react-router-dom";
import { AlertIcon, ErrorHexaIcon, InfoIcon } from "../../icons";
import { InventorySummary, PurchasingSummary, ShiftClosingSummary } from "../../types/Dashboard";

interface AlertsPanelProps {
  inventorySummary: InventorySummary | null;
  purchasingSummary: PurchasingSummary | null;
  shiftClosingSummary: ShiftClosingSummary[];
  loading: boolean;
}

type Severity = "CRITICAL" | "WARNING" | "INFO";

type Alert = {
  severity: Severity;
  message: string;
  link?: string;
};

const VARIANCE_TOLERANCE = 1;

const SEVERITY_STYLE: Record<Severity, { badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  CRITICAL: { badge: "border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400", icon: ErrorHexaIcon },
  WARNING: { badge: "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-orange-400", icon: AlertIcon },
  INFO: { badge: "border-blue-light-200 bg-blue-light-50 text-blue-light-700 dark:border-blue-light-500/30 dark:bg-blue-light-500/10 dark:text-blue-light-400", icon: InfoIcon },
};

export default function AlertsPanel({ inventorySummary, purchasingSummary, shiftClosingSummary, loading }: AlertsPanelProps) {
  const alerts: Alert[] = [];

  if (inventorySummary) {
    if (inventorySummary.OutOfStockCount > 0) {
      alerts.push({
        severity: "CRITICAL",
        message: `${inventorySummary.OutOfStockCount} product${inventorySummary.OutOfStockCount === 1 ? "" : "s"} out of stock.`,
        link: "/inventory",
      });
    }
    if (inventorySummary.LowStockCount > 0) {
      alerts.push({
        severity: "WARNING",
        message: `${inventorySummary.LowStockCount} product${inventorySummary.LowStockCount === 1 ? "" : "s"} low on stock.`,
        link: "/inventory",
      });
    }
    if (inventorySummary.ExpiringSoonCount > 0) {
      alerts.push({
        severity: "WARNING",
        message: `${inventorySummary.ExpiringSoonCount} product${inventorySummary.ExpiringSoonCount === 1 ? "" : "s"} expiring soon.`,
        link: "/inventory",
      });
    }
  }

  if (purchasingSummary && purchasingSummary.PendingCount > 0) {
    alerts.push({
      severity: "WARNING",
      message: `${purchasingSummary.PendingCount} purchase${purchasingSummary.PendingCount === 1 ? "" : "s"} pending receiving.`,
      link: "/purchasing",
    });
  }

  const variances = shiftClosingSummary.filter((row) => Math.abs(row.Variance) > VARIANCE_TOLERANCE);
  if (variances.length > 0) {
    alerts.push({
      severity: "CRITICAL",
      message: `${variances.length} cashier shift${variances.length === 1 ? "" : "s"} closed with a cash variance.`,
    });
  }

  const grouped: Record<Severity, Alert[]> = { CRITICAL: [], WARNING: [], INFO: [] };
  for (const alert of alerts) grouped[alert.severity].push(alert);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Alerts</h3>

      {loading ? (
        <div className="py-6 text-center text-sm text-gray-400">Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">No active alerts. Everything looks good.</div>
      ) : (
        <div className="space-y-2">
          {(["CRITICAL", "WARNING", "INFO"] as Severity[]).flatMap((severity) =>
            grouped[severity].map((alert, index) => {
              const { badge, icon: Icon } = SEVERITY_STYLE[severity];
              const content = (
                <div className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${badge}`}>
                  <Icon className="size-5 shrink-0" />
                  <span>{alert.message}</span>
                </div>
              );

              return (
                <div key={`${severity}-${index}`}>
                  {alert.link ? <Link to={alert.link}>{content}</Link> : content}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
