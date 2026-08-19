import prisma from './src/config/prisma.js';

const categories = await prisma.category.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
const brands = await prisma.brand.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
const units = await prisma.unit.findMany({ take: 10, orderBy: { createdAt: 'desc' } });

console.log('CATEGORIES');
console.log(JSON.stringify(categories, null, 2));
console.log('BRANDS');
console.log(JSON.stringify(brands, null, 2));
console.log('UNITS');
console.log(JSON.stringify(units, null, 2));

await prisma.$disconnect();
