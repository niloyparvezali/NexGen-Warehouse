import bcrypt from "bcrypt";

export async function seedUsers(prisma) {
  console.log("🌱 Seeding administrator user...");

  const adminRole = await prisma.role.findUnique({
    where: {
      name: "Administrator",
    },
  });

  if (!adminRole) {
    throw new Error("Administrator role not found.");
  }

  const hashedPassword = await bcrypt.hash("admin", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@nexgen.local",
    },
    update: {
      first_name: "System",
      last_name: "Administrator",
      username: "admin",
      password: hashedPassword,
      role_id: adminRole.id,
      is_active: true,
    },
    create: {
      first_name: "System",
      last_name: "Administrator",
      username: "admin",
      email: "admin@nexgen.local",
      password: hashedPassword,
      role_id: adminRole.id,
      is_active: true,
    },
  });

  console.log("✅ Administrator user seeded.");
}
