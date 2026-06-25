import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize, authErrorResponse } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    authorize(req, ['COORDINATOR', 'ADMIN']);
    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;

    // Fetch all attendance records for this event
    const attendances = await prisma.attendance.findMany({
      where: {
        registration: {
          eventId: eventId
        }
      },
      include: {
        registration: {
          include: {
            student: true,
            event: true
          }
        }
      }
    });

    if (!attendances || attendances.length === 0) {
      return new NextResponse('No attendance records found for this event.', { status: 404 });
    }

    // Prepare CSV content
    const headers = ['Name', 'Email', 'Roll No', 'Department', 'Check-in Time'];
    
    const rows = attendances.map(a => {
      const student = a.registration.student;
      return [
        `"${student.name}"`,
        `"${student.email}"`,
        `"${student.roll_no || 'N/A'}"`,
        `"${student.department || 'N/A'}"`,
        `"${a.checkin_time.toISOString()}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const eventName = attendances[0].registration.event.title.replace(/[^a-zA-Z0-9]/g, '_');

    // Create response with file download headers
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="Attendance_${eventName}.csv"`,
      }
    });
    
  } catch (err: any) {
    if (err.message.startsWith('Unauthorized') || err.message.startsWith('Forbidden')) {
      return authErrorResponse(err);
    }
    return new NextResponse(err.message, { status: 500 });
  }
}
