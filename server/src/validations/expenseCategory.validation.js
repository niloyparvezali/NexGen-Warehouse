import { z } from "zod";

export const createExpenseCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(100),
  description: z.string().trim().max(255).optional(),
});

export const updateExpenseCategorySchema = createExpenseCategorySchema.partial();
