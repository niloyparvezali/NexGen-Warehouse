import prisma from "../config/prisma.js";

export const getAllExpenseCategories = async ({ page = 1, limit = 10, search = "" }) => {
  const skip = (page - 1) * Number(limit);

  const where = {
    isActive: true,
  };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [categories, total] = await Promise.all([
    prisma.expenseCategory.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.expenseCategory.count({
      where,
    }),
  ]);

  return {
    categories,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    },
  };
};

export const getExpenseCategoryById = async (id) => {
  return prisma.expenseCategory.findUnique({
    where: { id },
  });
};

export const getExpenseCategoryByName = async (name) => {
  return prisma.expenseCategory.findUnique({
    where: { name },
  });
};

export const createExpenseCategory = async (data) => {
  return prisma.expenseCategory.create({
    data,
  });
};

export const updateExpenseCategory = async (id, data) => {
  return prisma.expenseCategory.update({
    where: { id },
    data,
  });
};

export const deleteExpenseCategory = async (id) => {
  return prisma.expenseCategory.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

export const restoreExpenseCategory = async (id) => {
  return prisma.expenseCategory.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
};
