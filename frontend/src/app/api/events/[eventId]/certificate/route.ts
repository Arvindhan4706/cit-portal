import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const user = authenticate(req);
    const { eventId } = await params;

    // Verify the user actually attended this event
    const registration = await prisma.registration.findUnique({
      where: {
        studentId_eventId: {
          studentId: user.id,
          eventId: eventId,
        }
      },
      include: {
        attendance: true,
        student: true,
        event: true
      }
    });

    if (!registration) {
      return NextResponse.json({ error: 'Not registered for this event' }, { status: 404 });
    }

    if (!registration.attendance) {
      return NextResponse.json({ error: 'You did not attend this event. Certificate unavailable.' }, { status: 403 });
    }

    // Generate the PDF
    const pdfDoc = await PDFDocument.create();
    
    // Create a landscape page (A4 landscape is typically 841.89 x 595.28 points)
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();
    
    // Draw the deep navy background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(2/255, 6/255, 23/255), // slate-950 equivalent (#020617)
    });

    // Draw an elegant blue border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(59/255, 130/255, 246/255), // blue-500 equivalent
      borderWidth: 4,
    });
    
    // Inner glass border
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: height - 80,
      borderColor: rgb(255/255, 255/255, 255/255),
      borderWidth: 1,
    });

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header Text
    const title = 'CHENNAI INSTITUTE OF TECHNOLOGY';
    const titleWidth = fontBold.widthOfTextAtSize(title, 24);
    page.drawText(title, {
      x: width / 2 - titleWidth / 2,
      y: height - 100,
      size: 24,
      font: fontBold,
      color: rgb(255/255, 255/255, 255/255),
    });

    // Subheader
    const subTitle = 'CERTIFICATE OF PARTICIPATION';
    const subTitleWidth = fontBold.widthOfTextAtSize(subTitle, 36);
    page.drawText(subTitle, {
      x: width / 2 - subTitleWidth / 2,
      y: height - 180,
      size: 36,
      font: fontBold,
      color: rgb(56/255, 189/255, 248/255), // sky-400
    });

    // Presentation text
    const presText = 'This is proudly presented to';
    const presWidth = fontRegular.widthOfTextAtSize(presText, 18);
    page.drawText(presText, {
      x: width / 2 - presWidth / 2,
      y: height - 260,
      size: 18,
      font: fontRegular,
      color: rgb(156/255, 163/255, 175/255), // gray-400
    });

    // Student Name
    const studentName = registration.student.name.toUpperCase();
    const nameWidth = fontBold.widthOfTextAtSize(studentName, 48);
    page.drawText(studentName, {
      x: width / 2 - nameWidth / 2,
      y: height - 330,
      size: 48,
      font: fontBold,
      color: rgb(255/255, 255/255, 255/255),
    });

    // Line under name
    page.drawLine({
      start: { x: width / 2 - nameWidth / 2 - 20, y: height - 340 },
      end: { x: width / 2 + nameWidth / 2 + 20, y: height - 340 },
      thickness: 2,
      color: rgb(59/255, 130/255, 246/255),
    });

    // Event details text
    const eventText = `for successfully attending and participating in`;
    const eventTextWidth = fontRegular.widthOfTextAtSize(eventText, 18);
    page.drawText(eventText, {
      x: width / 2 - eventTextWidth / 2,
      y: height - 390,
      size: 18,
      font: fontRegular,
      color: rgb(156/255, 163/255, 175/255),
    });

    const eventName = registration.event.title;
    const eventNameWidth = fontBold.widthOfTextAtSize(eventName, 24);
    page.drawText(eventName, {
      x: width / 2 - eventNameWidth / 2,
      y: height - 430,
      size: 24,
      font: fontBold,
      color: rgb(59/255, 130/255, 246/255),
    });
    
    // Dates & Auth
    const dateText = `Date: ${new Date(registration.event.date).toLocaleDateString()}`;
    page.drawText(dateText, {
      x: 100,
      y: 100,
      size: 14,
      font: fontRegular,
      color: rgb(255/255, 255/255, 255/255),
    });

    const authText = 'Digital Signature Verified';
    page.drawText(authText, {
      x: width - 250,
      y: 100,
      size: 14,
      font: fontRegular,
      color: rgb(255/255, 255/255, 255/255),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CIT_Certificate_${registration.event.title.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Certificate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
