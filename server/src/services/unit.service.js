import prisma from "../config/prisma.js";

const normalizeUnitName = (value = "") => value?.trim().toLowerCase() || "";
const normalizeUnitSymbol = (value = "") => value?.trim().toLowerCase() || "";

function normalizeUnitData(data) {
  const shortName = data.shortName?.trim() || data.symbol?.trim() || data.name?.trim();

  return {
    ...data,
    shortName,
    description: data.description?.trim() || null,
  };
}

export async function getAllUnits({ page = 1, limit = 10, search = "" }) {
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    OR: [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        symbol: {
          contains: search,
          mode: "insensitive",
        },
      },
    ],
  };

  const [units, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.unit.count({
      where,
    }),
  ]);

  return {
    units,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getUnitById(id) {
  return prisma.unit.findUnique({
    where: { id },
  });
}

export async function getUnitByName(name, excludeId = null) {
  const normalizedName = normalizeUnitName(name);

  if (!normalizedName) {
    return null;
  }

  return prisma.unit.findFirst({
    where: {
      isActive: true,
      name: {
        equals: name?.trim(),
        mode: "insensitive",
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, name: true, isActive: true },
  });
}

export async function getUnitBySymbol(symbol) {
  const normalizedSymbol = normalizeUnitSymbol(symbol);

  if (!normalizedSymbol) {
    return null;
  }

  return prisma.unit.findFirst({
    where: {
      isActive: true,
      symbol: {
        equals: symbol?.trim(),
        mode: "insensitive",
      },
    },
    select: { id: true, symbol: true, isActive: true },
  });
}

export async function createUnit(data) {
  return prisma.unit.create({
    data: normalizeUnitData(data),
  });
}

export async function updateUnit(id, data) {
  return prisma.unit.update({
    where: { id },
    data: normalizeUnitData(data),
  });
}

export async function deleteUnit(id) {
  return prisma.unit.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

export async function restoreUnit(id) {
  return prisma.unit.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
}

export async function toggleUnitStatus(id, isActive) {
  return prisma.unit.update({
    where: { id },
    data: {
      isActive,
    },
  });
}
