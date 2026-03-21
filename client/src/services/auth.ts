import { LoginRequest } from "../types/LoginRequest";
import { LoginResponse } from "../types/Response";
import { api } from "./api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return await api.post<LoginResponse>("/api/login", payload);
}