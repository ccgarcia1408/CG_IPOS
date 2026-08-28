import GenericReportPage from "../../components/reports/GenericReportPage";
import { ReportColumn } from "../../utils/reportExport";
import { money, percent } from "../../utils/reportFormat";
import { SalesByPaymentMethod } from "../../types/Dashboard";

const columns: ReportColumn<SalesByPaymentMethod>[] = [
  { key: "PaymentMethodName", header: "Payment Method" },
  { key: "TotalAmount", header: "Total Amount", align: "right", bold: true, format: (row) => money(row.TotalAmount) },
  { key: "TransactionCount", header: "Transactions", align: "right" },
  { key: "PercentageOfTotal", header: "% of Total", align: "right", format: (row) => percent(row.PercentageOfTotal) },
];

export default function SalesByPaymentMethodReport() {
  return (
    <GenericReportPage<SalesByPaymentMethod>
      title="Sales by Payment Method"
      breadcrumb="Sales by Payment Method"
      description="Sales totals broken down by the payment method used."
      endpoint="sales-by-payment-method"
      columns={columns}
      rowKey={(row) => row.PaymentMethodId}
    />
  );
}
