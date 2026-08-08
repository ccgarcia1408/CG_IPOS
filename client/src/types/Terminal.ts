export interface Terminal {
  TerminalId: number;
  BranchId: number;
  Name: string;
  Description: string | null;
  IsDeleted: number;
  DeletedBy: number | null;
  DateDeleted: string | null;
  CreatedAt: string;
  CreatedBy: number;
  UpdatedAt: string | null;
  UpdatedBy: number | null;
  IsActive: number;
}
