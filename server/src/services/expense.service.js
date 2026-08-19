import prisma from "../config/prisma.js";

const generateExpenseNumber = async () => {
  const count = await prisma.expense.count();

  return `EXP-${String(count + 1).padStart(6, "0")}`;
};

export const createExpense = async (data, userId) => {
  const expenseNumber = await generateExpenseNumber();

  return await prisma.expense.create({
    data: {
      expenseNumber,
      ...data,
      createdById: userId,
    },
  });
};

export const getAllExpenses = async (query) => {
  const {
    search = "",
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      {
        expenseNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        referenceNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        note: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (startDate || endDate) {
    where.expenseDate = {};

    if (startDate) {
      where.expenseDate.gte = new Date(startDate);
    }

    if (endDate) {
      where.expenseDate.lte = new Date(endDate);
    }
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        createdBy: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        expenseDate: "desc",
      },
    }),

    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.max(1, Math.ceil(total / Number(limit))),
    },
  };
};

export const getExpenseById = async (id) => {
  return await prisma.expense.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
};

export const updateExpense = async (id, data) => {
  return await prisma.expense.update({
    where: { id },
    data,
  });
};

export const deleteExpense = async (id) => {
  return await prisma.expense.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

export const restoreExpense = async (id) => {
  return prisma.expense.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
};
