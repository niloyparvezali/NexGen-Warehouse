import prisma from "../config/prisma.js";

export const getAllCustomers = async ({ page = 1, limit = 10, search = "" }) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        isActive: true,
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            notes: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {
        isActive: true,
      };

  const [customers, total] = await prisma.$transaction([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getCustomerById = async (id) =>
  prisma.customer.findUnique({
    where: { id },
  });

export const getCustomerByPhone = async (phone) => {
  if (!phone) return null;

  return prisma.customer.findFirst({
    where: { phone },
  });
};

export const getCustomerByEmail = async (email) => {
  if (!email) return null;

  return prisma.customer.findFirst({
    where: { email },
  });
};

export const createCustomer = async (data) =>
  prisma.customer.create({
    data,
  });

export const updateCustomer = async (id, data) =>
  prisma.customer.update({
    where: { id },
    data,
  });

export const deleteCustomer = async (id) =>
  prisma.customer.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

export const restoreCustomer = async (id) =>
  prisma.customer.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
