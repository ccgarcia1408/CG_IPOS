// Decodes a JWT's payload for DISPLAY purposes only (e.g. showing which branch the current
// session is pinned to). Never use this for authorization decisions -- the signature is not
// verified here; the backend is the only source of truth for access control.
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="));

    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}
