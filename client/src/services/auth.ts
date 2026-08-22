import { LoginRequest } from "../types/LoginRequest";
import { LoginResponse } from "../types/Response";
import { UserAuth } from "../types/UserAuth";
import { api } from "./api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return await api.post<LoginResponse>("/api/login", payload);
}

export async function updateProfilePicture(
  file: File
): Promise<{ success?: boolean; message?: string; data?: UserAuth }> {
  const formData = new FormData();
  formData.append("ProfilePicture", file);

  return await api.put("/api/auth/me/profile-picture", formData, { auth: true });
}

export async function selectBranch(
  pendingToken: string,
  tenantId: number,
  branchId: number
): Promise<LoginResponse> {
  return await api.post<LoginResponse>(
    "/api/login/select-branch",
    { TenantId: tenantId, BranchId: branchId },
    { token: pendingToken }
  );
}

// export async function login(payload: LoginRequest): Promise<LoginResponse> {
//   const response = await api.post<LoginResponse>("/api/login", payload);
//   return response.data;
// }