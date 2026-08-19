import { z } from "zod";

const optionalString = (max = 100) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(
    z.string().min(11, "Mobile number must be 11 digits.").max(11, "Mobile number must be 11 digits."),
  );

export const createSupplierSchema = z.object({
  supplierName: z
    .string()
    .trim()
    .min(2, "Supplier name must be at least 2 characters.")
    .max(100, "Supplier name cannot exceed 100 characters."),

  companyName: optionalString(100),
  contactPerson: optionalString(100),

  mobileNumber: optionalString(20).refine((value) => !value || /^\d{11}$/.test(value), {
    message: "Mobile number must be 11 digits.",
  }),
  phone: optionalString(20).refine((value) => !value || /^\d{11}$/.test(value), {
    message: "Mobile number must be 11 digits.",
  }),

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .optional()
    .or(z.literal("")),

  address: optionalString(500),
  city: optionalString(100),
  country: optionalString(100),
  taxNumber: optionalString(100),

  previousDue: z.coerce.number().min(0).optional().default(0),
  currentBalance: z.coerce.number().min(0).optional().default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
});

export const updateSupplierSchema = createSupplierSchema.partial();
