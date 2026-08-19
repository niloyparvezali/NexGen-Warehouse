export async function seedBrands(prisma) {
  console.log("🌱 Seeding brands...");

  const brands = [
    { name: "Samsung" },
    { name: "Apple" },
    { name: "Sony" },
    { name: "Walton" },
    { name: "Generic" },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand,
    });
  }

  console.log("✅ Brands seeded.");
}
