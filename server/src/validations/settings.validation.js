import { z } from "zod";

const optionalString = (max = 255) => z.string().trim().max(max).optional().nullable();

const phoneNumberSchema = optionalString(11).refine((value) => !value || /^\d{11}$/.test(value), {
  message: "Phone number must be 11 digits.",
});

export const settingsSchema = z.object({
  company_name: z.string().trim().min(1).optional(),
  company_logo: optionalString(500),
  company_address: optionalString(500),
  company_phone: phoneNumberSchema,
  company_email: optionalString(255),
  company_website: optionalString(255),
  tax_number: optionalString(100),
  currency: optionalString(20),
  timezone: optionalString(100),
  invoice_prefix: optionalString(20),
  purchase_prefix: optionalString(20),
  payment_prefix: optionalString(20),
  number_format: optionalString(50),
  barcode_type: optionalString(50),
  barcode_prefix: optionalString(20),
  auto_generate_barcode: z.boolean().optional(),
  barcode_print_size: optionalString(50),
  email_host: optionalString(255),
  email_port: z.number().int().positive().optional().nullable(),
  email_username: optionalString(255),
  email_password: optionalString(255),
  email_from: optionalString(255),
});

export const roleSchema = z.object({
  name: z.string().trim().min(1),
  description: optionalString(500),
  permissions: z.record(z.array(z.string())).optional(),
  is_active: z.boolean().optional(),
});

export const userSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  username: z.string().trim().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role_id: z.number().int().positive(),
  is_active: z.boolean().optional(),
});

export const passwordSchema = z.object({
  password: z.string().min(6),
});

export const backupSchema = z.object({
  filePath: z.string().min(1),
});
