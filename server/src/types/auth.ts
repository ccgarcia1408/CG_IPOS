export interface AuthUser {
    UserId: number;
    Username: string;
    RoleId: number;
    TenantId?: number | null;
    BranchId?: number | null;
    Scope?: string;
    iat?: number;
    exp?: number;
}

export interface RequestScope {
    isAdmin: boolean;
    TenantId: number | null;
    BranchId: number | null;
}
