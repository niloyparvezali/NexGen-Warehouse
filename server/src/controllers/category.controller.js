import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  restoreCategory,
} from "../services/category.service.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation.js";

export const getCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllCategories({
    page,
    limit,
    search,
    restoreCategory,
  });

  return ApiResponse.success(
    res,
    result,
    "Categories fetched successfully.",
    200,
  );
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return res.json(
    new ApiResponse(200, category, "Category fetched successfully."),
  );
});

export const createNewCategory = asyncHandler(async (req, res) => {
  const validatedData = createCategorySchema.parse(req.body);

  const existingCategory = await getCategoryByName(validatedData.name);

  if (existingCategory) {
    throw new ApiError(409, "Category already exists.");
  }

  const category = await createCategory(validatedData);

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully."));
});

export const updateExistingCategory = asyncHandler(async (req, res) => {
  const validatedData = updateCategorySchema.parse(req.body);

  const category = await getCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  if (validatedData.name && validatedData.name !== category.name) {
    const existingCategory = await getCategoryByName(validatedData.name);

    if (existingCategory) {
      throw new ApiError(409, "Category already exists.");
    }
  }

  const updatedCategory = await updateCategory(req.params.id, validatedData);

  return res.json(
    new ApiResponse(200, updatedCategory, "Category updated successfully."),
  );
});

export const removeCategory = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  await deleteCategory(req.params.id);

  return res.json(new ApiResponse(200, null, "Category deleted successfully."));
});
export const restoreExistingCategory = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  const restored = await restoreCategory(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Category restored successfully."),
  );
});
