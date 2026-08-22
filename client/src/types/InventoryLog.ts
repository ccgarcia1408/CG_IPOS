export interface InventoryLog {
  InventoryLogId: number;
  BranchId: number;
  BranchName: string;
  ProductId: number;
  ProductName: string;
  SKU: string | null;
  Barcode: string | null;
  TransactionType: string;
  ReferenceType: string;
  ReferenceId: number | null;
  Remarks: string | null;
  Quantity: number;
  StockBefore: number;
  StockAfter: number;
  CreatedAt: string;
  CreatedBy: number;
}
