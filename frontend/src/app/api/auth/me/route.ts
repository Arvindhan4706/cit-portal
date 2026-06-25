import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = authorize(req, ['STUDENT', 'FACULTY', 'COORDINATOR']);
    
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        registrations: {
          include: {
            event: true
          }
        }
      }
    });
    
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    const { password, ...safeUser } = dbUser;
    return NextResponse.json(safeUser);
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
