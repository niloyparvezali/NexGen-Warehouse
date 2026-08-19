import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  createSupplierPayment,
  getAllSupplierPayments,
  getSupplierDue,
} from "../services/supplierPayment.service.js";

import { createSupplierPaymentSchema } from "../validations/supplierPayment.validation.js";

export const createPayment = asyncHandler(async (req, res) => {
  const validatedData = createSupplierPaymentSchema.parse(req.body);

  const payment = await createSupplierPayment(validatedData, req.user.id);

  return res
    .status(201)
    .json(
      new ApiResponse(201, payment, "Supplier payment created successfully."),
    );
});

export const getPayments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const payments = await getAllSupplierPayments({ page, limit, search });

  return res.json(
    new ApiResponse(200, payments, "Supplier payments fetched successfully."),
  );
});

export const getDueSummary = asyncHandler(async (req, res) => {
  const due = await getSupplierDue(req.params.supplierId);

  return res.json(
    new ApiResponse(200, due, "Supplier due summary fetched successfully."),
  );
});
