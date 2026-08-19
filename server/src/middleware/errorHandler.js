import ApiResponse from "../utils/ApiResponse.js";
import { env } from "../config/env.js";

const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  const statusCode = err.statusCode || 500;
  const message = env.NODE_ENV === "production" && statusCode >= 500
    ? "Something went wrong. Please try again."
    : err.message || "Internal Server Error";

  return ApiResponse.error(res, message, statusCode);
};

export default errorHandler;
