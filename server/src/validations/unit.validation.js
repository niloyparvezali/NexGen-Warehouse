import { z } from "zod";

export const createUnitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Unit name must be at least 2 characters.")
    .max(100, "Unit name cannot exceed 100 characters."),

  symbol: z
    .string()
    .trim()
    .min(1, "Unit symbol is required.")
    .max(10, "Unit symbol cannot exceed 10 characters."),

  shortName: z
    .string()
    .trim()
    .max(20, "Short name cannot exceed 20 characters.")
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
});

export const updateUnitSchema = createUnitSchema.partial();
