import prisma from './src/config/prisma.js';

async function main() {
  try {
    const results = await prisma.$queryRawUnsafe(
      "select migration_name, finished_at, logs, applied_steps_count from \"_prisma_migrations\" order by finished_at",
    );
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
