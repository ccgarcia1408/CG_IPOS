import type { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import type ApiError from "../utils/ApiError";

const errorMiddleware = (err: Partial<ApiError>, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  logger.error(message);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
};

export default errorMiddleware;
