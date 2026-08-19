import prisma from "../config/prisma.js";

const normalizeCategoryName = (value = "") => value?.trim().toLowerCase() || "";

export async function getAllCategories({ page = 1, limit = 10, search = "" }) {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,

    name: {
      contains: search,
      mode: "insensitive",
    },
  };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.category.count({
      where,
    }),
  ]);

  return {
    categories,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getCategoryById(id) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(data) {
  return prisma.category.create({
    data,
  });
}

export async function updateCategory(id, data) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id) {
  return prisma.category.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}
export async function getCategoryByName(name) {
  const normalizedName = normalizeCategoryName(name);

  if (!normalizedName) {
    return null;
  }

  return prisma.category.findFirst({
    where: {
      isActive: true,
      name: {
        equals: name?.trim(),
        mode: "insensitive",
      },
    },
    select: { id: true, name: true, isActive: true },
  });
}

export async function toggleCategoryStatus(id, isActive) {
  return prisma.category.update({
    where: { id },
    data: { isActive },
  });
}
export async function restoreCategory(id) {
  return prisma.category.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
}
