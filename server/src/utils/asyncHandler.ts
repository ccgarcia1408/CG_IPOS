import type { NextFunction, Request, RequestHandler, Response } from "express";

// Every route here declares plain :named params (never a wildcard) and reads query values as
// scalars, so handlers see those narrowed shapes instead of Express's array-capable defaults.
export type AppRequest = Request<
  Record<string, string>,
  unknown,
  any,
  Record<string, string | undefined>
>;

type AsyncRequestHandler = (req: AppRequest, res: Response, next: NextFunction) => unknown;

const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as unknown as AppRequest, res, next)).catch(next);
  };

export default asyncHandler;
