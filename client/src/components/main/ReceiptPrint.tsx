import { Sale } from "../../types/Sale";

const money = (value: number | string) => `${Number(value).toFixed(2)}`;

interface ReceiptPrintProps {
  sale: Sale | null;
}

export default function ReceiptPrint({ sale }: ReceiptPrintProps) {
  if (!sale) return null;

  return (
    <div id="receipt-print-root">
      <div className="p-3 font-mono text-xs leading-tight text-black">
        <div className="text-center">
          <p className="text-sm font-bold">{sale.BranchDescription || sale.BranchName}</p>
          <p>{sale.TerminalName}</p>
          <p>{new Date(sale.CreatedAt).toLocaleString()}</p>
          <p>OR #{sale.ORNo}</p>
        </div>
        <div className="my-2 border-t border-dashed border-black" />
        {(sale.Items ?? []).map((item) => (
          <div key={item.SaleItemId} className="mb-1">
            <div>{item.ProductName}</div>
            <div className="flex justify-between">
              <span>{item.Quantity} x {money(item.Price)}{item.Discount > 0 ? ` - ${money(item.Discount)}` : ""}</span>
              <span>{money(item.Total)}</span>
            </div>
          </div>
        ))}
        <div className="my-2 border-t border-dashed border-black" />
        <div className="flex justify-between"><span>Subtotal</span><span>{money(sale.SubTotal)}</span></div>
        <div className="flex justify-between"><span>Discount{sale.DiscountName ? ` (${sale.DiscountName})` : ""}</span><span>{money(sale.Discount)}</span></div>
        <div className="flex justify-between"><span>Tax{sale.TaxName ? ` (${sale.TaxName})` : ""}</span><span>{money(sale.Tax)}</span></div>
        <div className="flex justify-between font-bold"><span>Total</span><span>{money(sale.Total)}</span></div>
        <div className="flex justify-between"><span>Paid ({sale.PaymentMethodName ?? "-"})</span><span>{money(sale.AmountPaid)}</span></div>
        <div className="flex justify-between"><span>Change</span><span>{money(sale.ChangeAmount)}</span></div>
        <div className="my-2 border-t border-dashed border-black" />
        <p className="text-center">Cashier: {sale.CashierFirstName} {sale.CashierLastName}</p>
        {sale.IsCancelled === 1 && <p className="text-center font-bold">** VOIDED **</p>}
        <p className="mt-2 text-center">Thank you!</p>
      </div>
    </div>
  );
}
