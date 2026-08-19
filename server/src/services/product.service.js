import prisma from "../config/prisma.js";
import { generateSku } from "../utils/generateSku.js";
import { generateBarcode } from "../utils/generateBarcode.js";

export async function getAllProducts({ page = 1, limit = 10, search = "", category = "" }) {
  const skip = (page - 1) * limit;
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
    OR: [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        barcode: {
          contains: search,
          mode: "insensitive",
        },
      },
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        brand: true,
        unit: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      unit: true,
    },
  });
}

export async function getProductByBarcode(barcode) {
  return prisma.product.findUnique({
    where: { barcode },
  });
}

export async function getProductBySku(sku) {
  return prisma.product.findUnique({
    where: { sku },
  });
}

export async function generateUniqueSku(productName) {
  let sku;
  let exists = true;

  while (exists) {
    sku = generateSku(productName);

    exists = await prisma.product.findUnique({
      where: {
        sku,
      },
    });
  }

  return sku;
}

export async function createProduct(data) {
  const normalizedSku = data.sku?.trim() || (await generateUniqueSku(data.name));
  const normalizedBarcode = data.barcode?.trim() || generateBarcode("PRD");

  return prisma.product.create({
    data: {
      ...data,
      sku: normalizedSku,
      barcode: normalizedBarcode,
      description: data.description?.trim() || null,
      warranty: data.warranty?.trim() || null,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      minimumStock: data.minimumStock ?? 0,
      stockQuantity: data.stockQuantity ?? 0,
      image: data.image?.trim() || null,
    },
  });
}

export async function updateProduct(id, data) {
  return prisma.product.update({
    where: {
      id,
    },
    data: {
      ...data,
      ...(data.warranty !== undefined ? { warranty: data.warranty?.trim() || null } : {}),
    },
  });
}

export async function deleteProduct(id) {
  return prisma.product.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}

export async function restoreProduct(id) {
  return prisma.product.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
  });
}
