import type { ErrorRequestHandler } from "express";
import ApiError from "../utils/apiError";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};