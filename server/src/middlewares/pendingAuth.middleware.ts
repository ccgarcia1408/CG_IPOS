import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import type { AuthUser } from "../types/auth";

// Inverse of auth.middleware.ts: only accepts the short-lived pending token issued mid-login
// (before branch selection). Used solely by POST /api/login/select-branch.
const pendingAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next(new ApiError(401, "Authorization header is required"));
        }

        if (!authHeader.startsWith("Bearer ")) {
            return next(new ApiError(401, "Invalid authorization format"));
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return next(new ApiError(401, "Token is required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;

        if (decoded.Scope !== "PENDING_BRANCH_SELECTION") {
            return next(new ApiError(401, "Invalid or expired token"));
        }

        req.pendingUser = decoded;
        next();
    } catch (error) {
        return next(new ApiError(401, "Invalid or expired token"));
    }
};

export default pendingAuthMiddleware;
