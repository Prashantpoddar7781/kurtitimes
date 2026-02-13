import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
async function initAdmin() {
    try {
        const email = process.env.ADMIN_EMAIL || 'admin@kurtitimes.com';
        const password = process.env.ADMIN_PASSWORD || 'admin123';
        // Check if admin already exists
        const existing = await prisma.adminUser.findUnique({
            where: { email }
        });
        if (existing) {
            console.log('Admin user already exists');
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.adminUser.create({
            data: {
                email,
                password: hashedPassword,
                role: 'admin'
            }
        });
        console.log('Admin user created successfully:');
        console.log(`Email: ${admin.email}`);
        console.log(`ID: ${admin.id}`);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
initAdmin();
//# sourceMappingURL=initAdmin.js.map