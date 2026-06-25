import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticate } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
const router = Router();
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
router.get('/', async (req, res) => {
    try {
        const events = await prisma.event.findMany({ include: { club: true } });
        res.json(events);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', authenticate, async (req, res) => {
    try {
        const { title, description, venue, date, capacity, clubId } = req.body;
        const event = await prisma.event.create({
            data: {
                title,
                description,
                venue,
                date: new Date(date),
                capacity,
                clubId
            }
        });
        res.json(event);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post('/:eventId/register', authenticate, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.userId;
        // Check capacity
        const event = await prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { registrations: true } } } });
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        if (event._count.registrations >= event.capacity)
            return res.status(400).json({ error: 'Event is full' });
        // Generate static initial QR base, dynamic QR is handled later
        const qr_code = uuidv4();
        const registration = await prisma.registration.create({
            data: {
                studentId: userId,
                eventId,
                qr_code
            }
        });
        res.json(registration);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Import registrations from external CSV/List (filtering for CIT emails)
router.post('/:eventId/import', authenticate, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const { emails } = req.body; // array of email strings
        if (!Array.isArray(emails))
            return res.status(400).json({ error: 'Expected an array of emails' });
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        // Filter for CIT domains
        const citEmails = emails.filter((email) => email.endsWith('@citchennai.net'));
        // Find all users matching these emails
        const users = await prisma.user.findMany({
            where: {
                email: { in: citEmails },
                role: 'STUDENT'
            }
        });
        let importedCount = 0;
        for (const user of users) {
            // Check if already registered
            const existing = await prisma.registration.findUnique({
                where: {
                    studentId_eventId: { studentId: user.id, eventId }
                }
            });
            if (!existing) {
                await prisma.registration.create({
                    data: {
                        studentId: user.id,
                        eventId,
                        qr_code: uuidv4()
                    }
                });
                importedCount++;
            }
        }
        res.json({
            message: `Successfully imported ${importedCount} CIT students. Ignored ${emails.length - citEmails.length} non-CIT emails.`,
            importedCount,
            totalProcessed: emails.length
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
//# sourceMappingURL=events.js.map