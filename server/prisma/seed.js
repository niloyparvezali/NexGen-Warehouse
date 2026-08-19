import { runSeeds } from "./seeds/index.js";

runSeeds()
  .then(() => {
    console.log("✅ Database seeding completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database seeding failed.");
    console.error(error);
    process.exit(1);
  });