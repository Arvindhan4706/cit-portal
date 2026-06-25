import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    authorize(req, ['COORDINATOR']);
    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;
    
    const body = await req.json();
    const { emails } = body;

    if (!Array.isArray(emails)) {
      return NextResponse.json({ error: 'Expected an array of emails' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const citEmails = emails.filter((email: string) => email.endsWith('@citchennai.net'));

    const users = await prisma.user.findMany({
      where: {
        email: { in: citEmails },
        role: 'STUDENT'
      }
    });

    let importedCount = 0;

    for (const user of users) {
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

    return NextResponse.json({ 
      message: `Successfully imported ${importedCount} CIT students. Ignored ${emails.length - citEmails.length} non-CIT emails.`,
      importedCount,
      totalProcessed: emails.length 
    });
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
