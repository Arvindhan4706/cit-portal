import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = authorize(req, ['STUDENT']);
    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;
    const userId = user.userId;

    // Check capacity
    const event = await prisma.event.findUnique({ 
      where: { id: eventId }, 
      include: { _count: { select: { registrations: true } } } 
    });
    
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    if (event._count.registrations >= event.capacity) return NextResponse.json({ error: 'Event is full' }, { status: 400 });

    const qr_code = uuidv4();

    const registration = await prisma.registration.create({
      data: {
        studentId: userId,
        eventId,
        qr_code
      }
    });

    return NextResponse.json(registration);
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
