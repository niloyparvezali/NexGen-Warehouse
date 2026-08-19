import prisma from '../src/config/prisma.js';

async function check() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'admin' } },
          { username: { contains: 'admin' } },
        ],
      },
      include: { role: true },
    });

    console.log('Found users:', users.length);
    for (const u of users) {
      console.log({ id: u.id, email: u.email, username: u.username, is_active: u.is_active, role: u.role?.name });
    }
  } catch (err) {
    console.error('Error querying users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
