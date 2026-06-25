import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticate } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
const router = Router();
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const QR_SECRET = process.env.QR_SECRET || 'qr_super_secret';
// Student requests a dynamic QR code for an event
router.get('/qr/:eventId', authenticate, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.userId;
        const registration = await prisma.registration.findUnique({
            where: {
                studentId_eventId: {
                    studentId: userId,
                    eventId
                }
            },
            include: { event: true }
        });
        if (!registration)
            return res.status(404).json({ error: 'Registration not found' });
        // Check if the event has already ended (valid only until the end of the event date)
        // Assume event date is the start of the day, add 24 hours to get expiry
        const eventExpiry = new Date(registration.event.date.getTime() + 24 * 60 * 60 * 1000);
        if (Date.now() > eventExpiry.getTime()) {
            return res.status(403).json({ error: 'This event has expired. QR generation is disabled.' });
        }
        // Dynamic QR token valid for 30 seconds
        const qrToken = jwt.sign({ registrationId: registration.id, studentId: userId, eventId }, QR_SECRET, { expiresIn: '30s' });
        res.json({ qrToken });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Coordinator scans the QR token
router.post('/scan', authenticate, async (req, res) => {
    try {
        const { qrToken } = req.body;
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(qrToken, QR_SECRET);
        }
        catch (e) {
            return res.status(400).json({ error: 'Expired or Invalid QR Code' });
        }
        const { registrationId, studentId, eventId } = decoded;
        // Check if already attended
        const existing = await prisma.attendance.findUnique({ where: { registrationId } });
        if (existing)
            return res.status(400).json({ error: 'Attendance already marked' });
        const attendance = await prisma.attendance.create({
            data: {
                registrationId,
                verified: true
            }
        });
        // Auto generate OD Request
        await prisma.oDRequest.create({
            data: {
                studentId,
                eventId,
                status: 'PENDING'
            }
        });
        res.json({ message: 'Attendance marked successfully and OD Request generated', attendance });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Faculty scans the QR token to verify registration (does not mark attendance)
router.post('/verify', authenticate, async (req, res) => {
    try {
        const { qrToken } = req.body;
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(qrToken, QR_SECRET);
        }
        catch (e) {
            return res.status(400).json({ error: 'Expired or Invalid QR Code' });
        }
        const { registrationId, studentId, eventId } = decoded;
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: {
                student: { select: { name: true, roll_no: true, department: true } },
                event: { select: { title: true, date: true, venue: true } }
            }
        });
        if (!registration)
            return res.status(404).json({ error: 'Registration not found' });
        res.json({
            valid: true,
            student: registration.student,
            event: registration.event,
            status: registration.status
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
//# sourceMappingURL=attendance.js.map