export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Discount {
  DiscountId: number;
  Name: string;
  Description: string | null;
  Type: DiscountType;
  Value: number;
  IsDeleted: number;
  DeletedBy: number | null;
  DateDeleted: string | null;
  CreatedAt: string;
  CreatedBy: number;
  UpdatedAt: string | null;
  UpdatedBy: number | null;
  IsActive: number;
}
