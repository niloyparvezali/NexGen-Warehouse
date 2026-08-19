export async function seedRoles(prisma) {
  console.log("🌱 Seeding roles...");

  const roles = [
    { name: "Administrator" },
    { name: "Manager" },
    { name: "Staff" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("✅ Roles seeded.");
}
