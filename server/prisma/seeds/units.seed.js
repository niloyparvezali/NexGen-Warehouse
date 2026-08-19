export async function seedUnits(prisma) {
  console.log("🌱 Seeding units...");

  const units = [
    { name: "Piece", shortName: "pc", symbol: "pc" },
    { name: "Box", shortName: "box", symbol: "box" },
    { name: "Kilogram", shortName: "kg", symbol: "kg" },
    { name: "Gram", shortName: "g", symbol: "g" },
    { name: "Litre", shortName: "L", symbol: "L" },
    { name: "Millilitre", shortName: "ml", symbol: "ml" },
    { name: "Dozen", shortName: "doz", symbol: "doz" },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {
        shortName: unit.shortName,
        symbol: unit.symbol,
      },
      create: {
        name: unit.name,
        shortName: unit.shortName,
        symbol: unit.symbol,
      },
    });
  }

  console.log("✅ Units seeded.");
}
