import { SalesByPaymentMethod } from "../../types/Dashboard";

interface SalesByPaymentMethodCardProps {
  data: SalesByPaymentMethod[];
  loading: boolean;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function SalesByPaymentMethodCard({ data, loading }: SalesByPaymentMethodCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">Payment Methods</h3>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No payment methods configured.</div>
      ) : (
        <div className="space-y-4">
          {data.map((row) => (
            <div key={row.PaymentMethodId}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{row.PaymentMethodName}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {money(row.TotalAmount)} &middot; {row.TransactionCount} txn
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${row.PercentageOfTotal}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
