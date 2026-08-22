export interface Product {
  ProductId: number;
  CategoryId: number;
  Name: string;
  Description: string | null;
  Barcode: string | null;
  SKU: string | null;
  CostPrice: number;
  SellingPrice: number;
  ImagePath: string | null;
  ManufacturingDate: string | null;
  ExpiryDate: string | null;
  IsDeleted: number;
  DeletedBy: number | null;
  DateDeleted: string | null;
  CreatedAt: string;
  CreatedBy: number;
  UpdatedAt: string | null;
  UpdatedBy: number | null;
  IsActive: number;
}
