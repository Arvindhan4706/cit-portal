import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { userId } = authorize(req, ['STUDENT', 'FACULTY', 'COORDINATOR']);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        registrations: {
          include: {
            event: true,
            attendance: true
          }
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = authorize(req, ['STUDENT', 'FACULTY', 'COORDINATOR']);
    const body = await req.json();
    const { name, department, year } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(department && { department }),
        ...(year && { year: parseInt(year) })
      }
    });

    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
