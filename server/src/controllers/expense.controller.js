import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  restoreExpense,
} from "../services/expense.service.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../validations/expense.validation.js";

export const create = asyncHandler(async (req, res) => {
  const validatedData = createExpenseSchema.parse(req.body);

  const expense = await createExpense(validatedData, req.user.id);

  return res.json(
    new ApiResponse(201, expense, "Expense created successfully."),
  );
});

export const getAll = asyncHandler(async (req, res) => {
  const expenses = await getAllExpenses(req.query);

  return res.json(
    new ApiResponse(200, expenses, "Expenses fetched successfully."),
  );
});

export const getOne = asyncHandler(async (req, res) => {
  const expense = await getExpenseById(Number(req.params.id));

  if (!expense) {
    throw new ApiError(404, "Expense not found.");
  }

  return res.json(
    new ApiResponse(200, expense, "Expense fetched successfully."),
  );
});

export const update = asyncHandler(async (req, res) => {
  const validatedData = updateExpenseSchema.parse(req.body);

  const expense = await getExpenseById(Number(req.params.id));

  if (!expense) {
    throw new ApiError(404, "Expense not found.");
  }

  const updatedExpense = await updateExpense(Number(req.params.id), validatedData);

  return res.json(
    new ApiResponse(200, updatedExpense, "Expense updated successfully."),
  );
});

export const remove = asyncHandler(async (req, res) => {
  await deleteExpense(Number(req.params.id));

  return res.json(new ApiResponse(200, null, "Expense deleted successfully."));
});
export const restore = asyncHandler(async (req, res) => {
  const expense = await restoreExpense(Number(req.params.id));

  return res.json(
    new ApiResponse(200, expense, "Expense restored successfully."),
  );
});
