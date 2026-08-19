import { PrismaClient } from "@prisma/client";

import { seedRoles } from "./roles.seed.js";
import { seedUnits } from "./units.seed.js";
import { seedCategories } from "./categories.seed.js";
import { seedBrands } from "./brands.seed.js";
import { seedUsers } from "./users.seed.js";

const prisma = new PrismaClient();

export async function runSeeds() {
  console.log("🌱 Starting database seeding...");

  await seedRoles(prisma);
  await seedUnits(prisma);
  await seedCategories(prisma);
  await seedBrands(prisma);
  await seedUsers(prisma);

  console.log("✅ Database seeding finished.");
}

export { prisma };
