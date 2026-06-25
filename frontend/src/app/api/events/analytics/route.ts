import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    authorize(req, ['COORDINATOR', 'FACULTY']);

    const totalEvents = await prisma.event.count();
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalRegistrations = await prisma.registration.count();
    const totalAttendances = await prisma.attendance.count();

    const attendanceRate = totalRegistrations > 0 
      ? Math.round((totalAttendances / totalRegistrations) * 100) 
      : 0;

    return NextResponse.json({
      totalEvents,
      totalStudents,
      totalRegistrations,
      totalAttendances,
      attendanceRate
    });

  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
