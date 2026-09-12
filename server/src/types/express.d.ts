import type { AuthUser, RequestScope } from "./auth";

// Populated by auth.middleware / pendingAuth.middleware / branchAccess.middleware before any
// handler that reads them runs, so they are declared non-optional to match that guarantee.
declare global {
    namespace Express {
        interface Request {
            user: AuthUser;
            pendingUser: AuthUser;
            scope: RequestScope;
        }
    }
}

export {};
