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

export interface UpdateProfilePayload {
  FirstName?: string;
  MiddleName?: string | null;
  LastName?: string;
  Email?: string;
  Age?: number | null;
  Address?: string | null;
  ContactNo?: string | null;
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<{ success?: boolean; message?: string; data?: UserAuth }> {
  return await api.put("/api/auth/me", payload, { auth: true });
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

export async function requestPasswordReset(email: string): Promise<{ message?: string }> {
  return await api.post("/api/forgot-password/request", { Email: email });
}

export async function verifyResetCode(email: string, code: string): Promise<{ message?: string }> {
  return await api.post("/api/forgot-password/verify-code", { Email: email, Code: code });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ message?: string }> {
  return await api.post("/api/forgot-password/reset", { Email: email, Code: code, NewPassword: newPassword });
}

// export async function login(payload: LoginRequest): Promise<LoginResponse> {
//   const response = await api.post<LoginResponse>("/api/login", payload);
//   return response.data;
// }