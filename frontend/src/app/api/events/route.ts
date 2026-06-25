import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const events = await prisma.event.findMany({ include: { club: true } });
    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    authorize(req, ['FACULTY', 'COORDINATOR']);

    const body = await req.json();
    const { title, description, venue, date, capacity, clubId } = body;

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
    return NextResponse.json(event);
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
