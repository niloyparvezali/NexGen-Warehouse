import prisma from "../config/prisma.js";

export const getAllSuppliers = async ({ page = 1, limit = 10, search = "" }) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            supplierName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            companyName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            contactPerson: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            mobileNumber: {
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
            country: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [suppliers, total] = await prisma.$transaction([
    prisma.supplier.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.supplier.count({
      where,
    }),
  ]);

  return {
    suppliers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getSupplierById = async (id) => {
  return prisma.supplier.findUnique({
    where: {
      id,
    },
  });
};

export const getSupplierByCompany = async (companyName) => {
  if (!companyName) return null;

  return prisma.supplier.findFirst({
    where: {
      companyName,
    },
  });
};

export const getSupplierByEmail = async (email) => {
  if (!email) return null;

  return prisma.supplier.findFirst({
    where: {
      email,
    },
  });
};

export const getSupplierByPhone = async (phone) => {
  if (!phone) return null;

  return prisma.supplier.findFirst({
    where: {
      mobileNumber: phone,
    },
  });
};

export const createSupplier = async (data) => {
  return prisma.supplier.create({
    data,
  });
};

export const updateSupplier = async (id, data) => {
  return prisma.supplier.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteSupplier = async (id) => {
  return prisma.supplier.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

export const restoreSupplier = async (id) => {
  return prisma.supplier.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
  });
};
