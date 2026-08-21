export interface Tax {
  TaxId: number;
  Name: string;
  Description: string | null;
  Rate: number;
  IsDeleted: number;
  DeletedBy: number | null;
  DateDeleted: string | null;
  CreatedAt: string;
  CreatedBy: number;
  UpdatedAt: string | null;
  UpdatedBy: number | null;
  IsActive: number;
}
