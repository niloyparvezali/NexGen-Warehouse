export async function seedCategories(prisma) {
  console.log("🌱 Seeding categories...");

  const categories = [
    { name: "Router" },
    { name: "Switch" },
    { name: "CCTV & Camera" },
    { name: "Fiber Optic" },
    { name: "OLT & ONU" },
    { name: "Network Cable" },
    { name: "Connectors & Accessories" },
    { name: "PoE & Power" },
    { name: "Accessories" },
    { name: "Tools" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories seeded.");
}
