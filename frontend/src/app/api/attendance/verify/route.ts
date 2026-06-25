import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const QR_SECRET = process.env.QR_SECRET || 'qr_super_secret';

export async function POST(req: NextRequest) {
  try {
    authorize(req, ['FACULTY', 'COORDINATOR']);
    
    const body = await req.json();
    const { qrToken } = body;

    let decoded;
    try {
      decoded = jwt.verify(qrToken, QR_SECRET) as any;
    } catch (e) {
      return NextResponse.json({ error: 'Expired or Invalid QR Code' }, { status: 400 });
    }
    
    const { registrationId, studentId, eventId } = decoded;
    
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        student: { select: { name: true, roll_no: true, department: true } },
        event: { select: { title: true, date: true, venue: true } }
      }
    });
    
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    
    return NextResponse.json({
      valid: true,
      student: registration.student,
      event: registration.event,
      status: registration.status
    });
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
