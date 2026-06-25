import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticate } from '../middleware/auth.js';
const router = Router();
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, roll_no, department, year } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
                roll_no,
                department,
                year
            }
        });
        res.json({ message: 'User created', userId: user.id });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password, expectedRole } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        if (expectedRole && user.role !== expectedRole) {
            return res.status(403).json({ error: `Unauthorized. This portal is strictly for ${expectedRole}s.` });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ error: 'Invalid password' });
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/me', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                registrations: {
                    include: {
                        event: true
                    }
                }
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Remove password hash from response
        const { password, ...safeUser } = user;
        res.json(safeUser);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
//# sourceMappingURL=auth.js.map