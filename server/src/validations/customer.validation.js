import { z } from "zod";

const optionalString = (max = 255) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const phoneNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(
    z.string().min(11, "Mobile number must be 11 digits.").max(11, "Mobile number must be 11 digits."),
  );

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters.")
    .max(100, "Customer name cannot exceed 100 characters."),

  phone: phoneNumberSchema,

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .optional()
    .or(z.literal("")),

  address: optionalString(255),
  city: optionalString(100),
  customerType: z.enum(["RETAIL", "WHOLESALE"]).optional().default("RETAIL"),
  previousDue: z.coerce.number().min(0).optional().default(0),
  currentBalance: z.coerce.number().min(0).optional().default(0),
  notes: optionalString(1000),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  openingDue: z.coerce.number().min(0).optional().default(0),
});

export const updateCustomerSchema = createCustomerSchema.partial();
