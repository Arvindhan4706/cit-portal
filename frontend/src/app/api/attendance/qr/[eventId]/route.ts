import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const QR_SECRET = process.env.QR_SECRET || 'qr_super_secret';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = authorize(req, ['STUDENT']);
    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;
    const userId = user.userId;
    
    const registration = await prisma.registration.findUnique({
      where: {
        studentId_eventId: {
          studentId: userId,
          eventId
        }
      },
      include: { event: true }
    });
    
    if (!registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

    const eventExpiry = new Date(registration.event.date.getTime() + 24 * 60 * 60 * 1000);
    if (Date.now() > eventExpiry.getTime()) {
      return NextResponse.json({ error: 'This event has expired. QR generation is disabled.' }, { status: 403 });
    }
    
    const qrToken = jwt.sign(
      { registrationId: registration.id, studentId: userId, eventId },
      QR_SECRET,
      { expiresIn: '30s' }
    );
    
    return NextResponse.json({ qrToken });
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
