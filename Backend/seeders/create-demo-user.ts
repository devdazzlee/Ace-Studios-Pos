import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    const email = 'admin@acestudios.com';
    const password = 'admin@123';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Demo user already exists:', email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    });

    console.log('');
    console.log('✅ Demo user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Email   : admin@acestudios.com');
    console.log('  Password: admin@123');
    console.log('  Role    : SUPER_ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
