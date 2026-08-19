import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  getCustomerByEmail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
} from "../services/customer.service.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validations/customer.validation.js";

const normalizeCustomerPayload = (data) => ({
  ...data,
  name: data.name?.trim(),
  phone: data.phone?.trim() || null,
  email: data.email?.trim() || null,
  address: data.address?.trim() || null,
  city: data.city?.trim() || null,
  notes: data.notes?.trim() || null,
  customerType: data.customerType ?? "RETAIL",
  previousDue: Number(data.previousDue ?? data.openingDue ?? 0),
  currentBalance: Number(data.currentBalance ?? 0),
  status: data.status ?? "ACTIVE",
});

// Get All Customers
export const getCustomers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const result = await getAllCustomers({
    page,
    limit,
    search,
  });

  return res.json(
    new ApiResponse(200, result, "Customers fetched successfully."),
  );
});

// Get Customer By ID
export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    throw new ApiError(404, "Customer not found.");
  }

  return res.json(
    new ApiResponse(200, customer, "Customer fetched successfully."),
  );
});

// Create Customer
export const createNewCustomer = asyncHandler(async (req, res) => {
  const validatedData = createCustomerSchema.parse(req.body);
  const normalizedData = normalizeCustomerPayload(validatedData);

  if (normalizedData.phone) {
    const existingPhone = await getCustomerByPhone(normalizedData.phone);

    if (existingPhone) {
      throw new ApiError(409, "Phone number already exists.");
    }
  }

  if (normalizedData.email) {
    const existingEmail = await getCustomerByEmail(normalizedData.email);

    if (existingEmail) {
      throw new ApiError(409, "Email already exists.");
    }
  }

  const customer = await createCustomer(normalizedData);

  return res
    .status(201)
    .json(new ApiResponse(201, customer, "Customer created successfully."));
});

// Update Customer
export const updateExistingCustomer = asyncHandler(async (req, res) => {
  const validatedData = updateCustomerSchema.parse(req.body);
  const normalizedData = normalizeCustomerPayload(validatedData);

  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    throw new ApiError(404, "Customer not found.");
  }

  if (normalizedData.phone && normalizedData.phone !== customer.phone) {
    const existingPhone = await getCustomerByPhone(normalizedData.phone);

    if (existingPhone) {
      throw new ApiError(409, "Phone number already exists.");
    }
  }

  if (normalizedData.email && normalizedData.email !== customer.email) {
    const existingEmail = await getCustomerByEmail(normalizedData.email);

    if (existingEmail) {
      throw new ApiError(409, "Email already exists.");
    }
  }

  const updated = await updateCustomer(req.params.id, normalizedData);

  return res.json(
    new ApiResponse(200, updated, "Customer updated successfully."),
  );
});

// Soft Delete Customer
export const removeCustomer = asyncHandler(async (req, res) => {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    throw new ApiError(404, "Customer not found.");
  }

  await deleteCustomer(req.params.id);

  return res.json(new ApiResponse(200, null, "Customer deleted successfully."));
});

// Restore Customer
export const restoreExistingCustomer = asyncHandler(async (req, res) => {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    throw new ApiError(404, "Customer not found.");
  }

  const restored = await restoreCustomer(req.params.id);

  return res.json(
    new ApiResponse(200, restored, "Customer restored successfully."),
  );
});
