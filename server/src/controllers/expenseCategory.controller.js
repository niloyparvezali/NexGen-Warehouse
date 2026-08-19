import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  getAllExpenseCategories,
  getExpenseCategoryById,
  getExpenseCategoryByName,
  restoreExpenseCategory,
  updateExpenseCategory,
} from "../services/expenseCategory.service.js";
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "../validations/expenseCategory.validation.js";

export const getCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllExpenseCategories({
    page,
    limit,
    search,
  });

  return ApiResponse.success(
    res,
    result,
    "Expense categories fetched successfully.",
    200,
  );
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await getExpenseCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Expense category not found.");
  }

  return res.json(
    new ApiResponse(200, category, "Expense category fetched successfully."),
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const validatedData = createExpenseCategorySchema.parse(req.body);

  const existingCategory = await getExpenseCategoryByName(validatedData.name);

  if (existingCategory) {
    throw new ApiError(409, "Expense category already exists.");
  }

  const category = await createExpenseCategory(validatedData);

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Expense category created successfully."));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const validatedData = updateExpenseCategorySchema.parse(req.body);

  const category = await getExpenseCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Expense category not found.");
  }

  if (validatedData.name && validatedData.name !== category.name) {
    const existingCategory = await getExpenseCategoryByName(validatedData.name);

    if (existingCategory) {
      throw new ApiError(409, "Expense category already exists.");
    }
  }

  const updatedCategory = await updateExpenseCategory(req.params.id, validatedData);

  return res.json(
    new ApiResponse(200, updatedCategory, "Expense category updated successfully."),
  );
});

export const removeCategory = asyncHandler(async (req, res) => {
  const category = await getExpenseCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Expense category not found.");
  }

  await deleteExpenseCategory(req.params.id);

  return res.json(new ApiResponse(200, null, "Expense category deleted successfully."));
});

export const restoreCategory = asyncHandler(async (req, res) => {
  const category = await getExpenseCategoryById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Expense category not found.");
  }

  const restored = await restoreExpenseCategory(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Expense category restored successfully."),
  );
});
