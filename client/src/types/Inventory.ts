export interface Inventory {
  InventoryId: number;
  BranchId: number;
  ProductId: number;
  Quantity: number;
  MinimumStock: number;
  CreatedAt: string;
  UpdatedAt: string;
  ProductName: string;
  Barcode: string | null;
  SKU: string | null;
  ProductIsActive: number;
  BranchName: string;
  BranchDescription: string | null;
}
