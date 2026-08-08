export interface Supplier {
  SupplierId: number;
  SupplierName: string;
  ContactPerson: string | null;
  ContactNo: string | null;
  TelNo: string | null;
  Email: string | null;
  ProvinceId: number | null;
  MunicipalityId: number | null;
  BarangayId: number | null;
  OtherAddress: string | null;
  IsDeleted: number;
  DeletedBy: number | null;
  DateDeleted: string | null;
  CreatedAt: string;
  CreatedBy: number;
  UpdatedAt: string | null;
  UpdatedBy: number | null;
  IsActive: number;
}
