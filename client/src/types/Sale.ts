export interface SaleItem {
  SaleItemId: number;
  SaleId: number;
  ProductId: number;
  ProductName: string;
  SKU: string | null;
  Barcode: string | null;
  Quantity: number;
  Price: number;
  Discount: number;
  Total: number;
  QuantityReturned: number;
  CreatedAt: string;
}

export interface SaleReturn {
  SaleReturnId: number;
  SaleId: number;
  SaleItemId: number;
  ProductId: number;
  ProductName: string;
  QuantityReturned: number;
  RefundAmount: number;
  Reason: string;
  CreatedAt: string;
  CreatedBy: number;
}

export interface Sale {
  SaleId: number;
  BranchId: number;
  BranchName: string;
  BranchDescription: string | null;
  TerminalId: number;
  TerminalName: string;
  CashierId: number;
  CashierFirstName: string;
  CashierLastName: string;
  ORNo: string | null;
  ORId?: number | null;
  Date: string;
  SubTotal: number;
  Discount: number;
  Tax: number;
  Total: number;
  PaymentMethodId: number;
  PaymentMethodName: string | null;
  AmountPaid: number;
  ChangeAmount: number;
  IsCancelled: number;
  CancelledBy?: number | null;
  DateCancelled?: string | null;
  CancelReason: string | null;
  CreatedAt: string;
  CreatedBy?: number;
  ItemCount?: number;
  Items?: SaleItem[];
  Returns?: SaleReturn[];
}
