import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
const normalizeCreatedById = (createdById) => {
  const id = Number(createdById);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(401, "Invalid user identifier.");
  }

  return id;
};

export const stockIn = async ({
  productId,
  quantity,
  reference,
  note,
  createdById,
}) => {
  const createdBy = normalizeCreatedById(createdById);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stockQuantity: {
          increment: quantity,
        },
      },
    });

    const transaction = await tx.stockTransaction.create({
      data: {
        productId,
        type: "STOCK_IN",
        quantity,
        reference,
        note,
        createdById: createdBy,
      },
    });

    return {
      product: updatedProduct,
      transaction,
    };
  });
};
export const stockOut = async ({
  productId,
  quantity,
  reference,
  note,
  createdById,
}) => {
  const createdBy = normalizeCreatedById(createdById);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    if (product.stockQuantity < quantity) {
      throw new ApiError(400, "Insufficient stock.");
    }

    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });

    const transaction = await tx.stockTransaction.create({
      data: {
        productId,
        type: "STOCK_OUT",
        quantity,
        reference,
        note,
        createdById: createdBy,
      },
    });

    return {
      product: updatedProduct,
      transaction,
    };
  });
};
export const adjustStock = async ({
  productId,
  quantity,
  reference,
  note,
  createdById,
}) => {
  const createdBy = normalizeCreatedById(createdById);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    const newStock = product.stockQuantity + quantity;

    if (newStock < 0) {
      throw new ApiError(400, "Stock cannot be negative.");
    }

    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stockQuantity: newStock,
      },
    });

    const transaction = await tx.stockTransaction.create({
      data: {
        productId,
        type: "ADJUSTMENT",
        quantity,
        reference,
        note,
        createdById: createdBy,
      },
    });

    return {
      product: updatedProduct,
      transaction,
    };
  });
};
export const getStockTransactions = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [transactions, total] = await prisma.$transaction([
    prisma.stockTransaction.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: true,
        createdBy: true,
      },
    }),

    prisma.stockTransaction.count(),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};
