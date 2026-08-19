import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  createCustomerPayment,
  getAllCustomerPayments,
  getCustomerDue,
} from "../services/customerPayment.service.js";

import { createCustomerPaymentSchema } from "../validations/customerPayment.validation.js";

// Create Payment
export const createPayment = asyncHandler(async (req, res) => {
  const validatedData = createCustomerPaymentSchema.parse(req.body);

  const payment = await createCustomerPayment(validatedData, req.user.id);

  return res
    .status(201)
    .json(
      new ApiResponse(201, payment, "Customer payment received successfully."),
    );
});

// Get All Payments
export const getPayments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const payments = await getAllCustomerPayments({ page, limit, search });

  return res.json(
    new ApiResponse(200, payments, "Customer payments fetched successfully."),
  );
});

// Get Customer Due Summary
export const getDueSummary = asyncHandler(async (req, res) => {
  const due = await getCustomerDue(req.params.customerId);

  return res.json(
    new ApiResponse(200, due, "Customer due summary fetched successfully."),
  );
});
