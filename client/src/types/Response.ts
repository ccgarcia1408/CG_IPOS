import { UserAuth } from "./UserAuth";

export type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  data?: {
    token?: string;
    user?: UserAuth;
  };
};