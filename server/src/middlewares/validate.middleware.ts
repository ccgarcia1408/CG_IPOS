import type { NextFunction, Request, Response } from "express";
import type { Schema } from "joi";
import ApiError from "../utils/ApiError";

type ValidatedProperty = "body" | "query" | "params";

const validate = (schema: Schema, property: ValidatedProperty = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map((item) => item.message).join(", ");
      return next(new ApiError(400, message));
    }

    // Express 5 types mark query/params as read-only getters, so the write needs a cast.
    (req as unknown as Record<string, unknown>)[property] = value;
    next();
  };
};

export default validate;
