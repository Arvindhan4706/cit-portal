import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const QR_SECRET = process.env.QR_SECRET || 'qr_super_secret';

export async function POST(req: NextRequest) {
  try {
    authorize(req, ['COORDINATOR']);
    
    const body = await req.json();
    const { qrToken } = body;

    let decoded;
    try {
      decoded = jwt.verify(qrToken, QR_SECRET) as any;
    } catch (e) {
      return NextResponse.json({ error: 'Expired or Invalid QR Code' }, { status: 400 });
    }
    
    const { registrationId, studentId, eventId } = decoded;
    
    const existing = await prisma.attendance.findUnique({ where: { registrationId } });
    if (existing) return NextResponse.json({ error: 'Attendance already marked' }, { status: 400 });
    
    const attendance = await prisma.attendance.create({
      data: {
        registrationId,
        verified: true
      }
    });
    
    await prisma.oDRequest.create({
      data: {
        studentId,
        eventId,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json({ message: 'Attendance marked successfully and OD Request generated', attendance });
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
