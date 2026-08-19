import prisma from "../config/prisma.js";
import { formatInventoryValues } from "./financial.service.js";

const toNumber = (value) => Number(value ?? 0);

const mapMovementType = (type) => {
  switch (type) {
    case "STOCK_IN":
      return "Stock In";
    case "STOCK_OUT":
      return "Stock Out";
    case "ADJUSTMENT":
      return "Adjustment";
    default:
      return type;
  }
};

export const getInventoryItems = async ({
  page = 1,
  limit = 10,
  search = "",
  lowStockOnly = false,
  category = "",
} = {}) => {
  const searchValue = search?.trim();
  const normalizedCategory = category?.trim();

  const where = {
    isActive: true,
    ...(normalizedCategory
      ? {
          category: {
            name: {
              equals: normalizedCategory,
              mode: "insensitive",
            },
          },
        }
      : {}),
    ...(searchValue
      ? {
          OR: [
            {
              name: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              barcode: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      brand: true,
      unit: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const filteredProducts = lowStockOnly
    ? products.filter(
        (product) => product.stockQuantity > 0 && product.stockQuantity <= product.minimumStock,
      )
    : products;

  const total = filteredProducts.length;
  const skip = (page - 1) * limit;

  const pagedProducts = filteredProducts.slice(skip, skip + limit).map((product) => {
    const { stockValue, sellingValue } = formatInventoryValues(product, product.stockQuantity);
    const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.minimumStock;

    return {
      ...product,
      stockValue,
      sellingValue,
      isLowStock,
      stockStatus:
        product.stockQuantity === 0
          ? "Out of Stock"
          : isLowStock
            ? "Low Stock"
            : "In Stock",
    };
  });

  return {
    summary: {
      totalProducts: products.length,
      totalStock: products.reduce((sum, item) => sum + item.stockQuantity, 0),
      lowStock: products.filter(
        (item) => item.stockQuantity > 0 && item.stockQuantity <= item.minimumStock,
      ).length,
      outOfStock: products.filter((item) => item.stockQuantity === 0).length,
    },
    products: pagedProducts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getInventoryMovements = async ({
  page = 1,
  limit = 10,
  search = "",
  productId = "",
} = {}) => {
  const searchValue = search?.trim();

  const where = {
    ...(productId ? { productId } : {}),
    ...(searchValue
      ? {
          OR: [
            {
              reference: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              note: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              product: {
                is: {
                  name: {
                    contains: searchValue,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              product: {
                is: {
                  sku: {
                    contains: searchValue,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              product: {
                is: {
                  barcode: {
                    contains: searchValue,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const transactions = await prisma.stockTransaction.findMany({
    where,
    include: {
      product: {
        include: {
          category: true,
          brand: true,
          unit: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let balance = 0;
  const enrichedTransactions = transactions.map((transaction) => {
    const quantityIn = transaction.type === "STOCK_IN" || (transaction.type === "ADJUSTMENT" && transaction.quantity > 0)
      ? transaction.quantity
      : 0;
    const quantityOut = transaction.type === "STOCK_OUT" || (transaction.type === "ADJUSTMENT" && transaction.quantity < 0)
      ? Math.abs(transaction.quantity)
      : 0;

    if (transaction.type === "STOCK_IN") {
      balance += transaction.quantity;
    } else if (transaction.type === "STOCK_OUT") {
      balance -= transaction.quantity;
    } else if (transaction.type === "ADJUSTMENT") {
      balance += transaction.quantity;
    }

    return {
      ...transaction,
      quantityIn,
      quantityOut,
      balance,
      movementType: mapMovementType(transaction.type),
    };
  });

  const total = enrichedTransactions.length;
  const skip = (page - 1) * limit;

  return {
    transactions: enrichedTransactions.slice(skip, skip + limit),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};
