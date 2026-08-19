import prisma from "../config/prisma.js";

const normalizeBrandName = (value = "") => value?.trim().toLowerCase() || "";

export async function getAllBrands({ page = 1, limit = 10, search = "" }) {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    name: {
      contains: search,
      mode: "insensitive",
    },
  };

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.brand.count({
      where,
    }),
  ]);

  return {
    brands,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getBrandById(id) {
  return prisma.brand.findUnique({
    where: { id },
  });
}

export async function getBrandByName(name) {
  const normalizedName = normalizeBrandName(name);

  if (!normalizedName) {
    return null;
  }

  return prisma.brand.findFirst({
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

export async function createBrand(data) {
  return prisma.brand.create({
    data,
  });
}

export async function updateBrand(id, data) {
  return prisma.brand.update({
    where: { id },
    data,
  });
}

export async function deleteBrand(id) {
  return prisma.brand.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

export async function restoreBrand(id) {
  return prisma.brand.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
}

export async function toggleBrandStatus(id, isActive) {
  return prisma.brand.update({
    where: { id },
    data: {
      isActive,
    },
  });
}
