// export class ApiError extends Error {
//   status: number;
//   data: unknown;

//   constructor(message: string, status: number, data: unknown = null) {
//     super(message);
//     this.name = "ApiError";
//     this.status = status;
//     this.data = data;
//   }
// }

// THIS MUST USE

// export class ApiError<T = unknown> extends Error {
//   status: number;
//   data: T;

//   constructor(message: string, status: number, data: T) {
//     super(message);

//     this.name = "ApiError";
//     this.status = status;
//     this.data = data;

//     // Recommended when extending Error
//     Object.setPrototypeOf(this, ApiError.prototype);
//   }
// }

// SIMPLIER API ERROR CLASS
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  // One-off bearer token to use instead of the stored session token -- e.g. the short-lived
  // pending token issued mid-login, before the real session token exists.
  token?: string;
};

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawText);
    } catch {
      throw new Error("Invalid JSON response from server.");
    }
  }

  return rawText;
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, auth = false, token: tokenOverride } = options;

  const token = tokenOverride ?? localStorage.getItem("token");

  const finalHeaders: Record<string, string> = {
    ...headers,
  };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }
  // For FormData, no Content-Type is set here -- the browser fills in
  // "multipart/form-data; boundary=..." itself, which it can only do correctly if we don't
  // set it manually.

  if ((auth || tokenOverride) && token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    let message = "Request failed.";

    if (data && typeof data === "object" && "message" in data) {
      message = String((data as { message?: string }).message || message);
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (response.statusText) {
      message = response.statusText;
    }

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T = unknown>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T = unknown>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(endpoint, { ...options, method: "DELETE" }),
};