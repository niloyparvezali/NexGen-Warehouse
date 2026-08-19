import ApiResponse from "../utils/ApiResponse.js";

const notFound = (req, res) => {
  return ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
};

export default notFound;
