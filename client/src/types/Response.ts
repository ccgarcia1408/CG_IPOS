import { UserAuth } from "./UserAuth";

export type LoginTenantOption = {
  TenantId: number;
  TenantName: string;
};

export type LoginBranchOption = {
  BranchId: number;
  BranchName: string;
  TenantId: number;
};

export type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  data?: {
    token?: string;
    user?: UserAuth;
    requiresBranchSelection?: boolean;
    pendingToken?: string;
    tenants?: LoginTenantOption[];
    branches?: LoginBranchOption[];
  };
};