export type PurchaseStatus = "pending" | "received" | "cancelled";

export interface PurchaseItem {
  PurchaseItemId: number;
  PurchaseId: number;
  ProductId: number;
  ProductName: string;
  SKU: string | null;
  Barcode: string | null;
  Quantity: number;
  CostPrice: number;
  Total: number;
  CreatedAt: string;
}

export interface Purchase {
  PurchaseId: number;
  BranchId: number;
  BranchName: string;
  BranchDescription: string | null;
  SupplierId: number;
  SupplierName: string;
  PurchaseDate: string;
  TotalAmount: number;
  Status: PurchaseStatus;
  CancelReason: string | null;
  CancelledBy: number | null;
  DateCancelled: string | null;
  CreatedAt: string;
  CreatedBy: number;
  ItemCount?: number;
  Items?: PurchaseItem[];
}
