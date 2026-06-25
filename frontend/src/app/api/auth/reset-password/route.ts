import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role, securityVerification, newPassword } = body;

    if (!email || !role || !securityVerification || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (!email.endsWith('@citchennai.net')) {
      return NextResponse.json({ error: 'Only @citchennai.net institutional emails are allowed.' }, { status: 403 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification details.' }, { status: 401 });
    }

    if (user.role !== role) {
      return NextResponse.json({ error: 'Invalid verification details.' }, { status: 401 });
    }

    // Security Verification Check
    let verified = false;
    if (role === 'STUDENT') {
      verified = user.roll_no === securityVerification;
    } else {
      // Faculty and Coordinators verify via their Department code/name
      verified = user.department === securityVerification;
    }

    if (!verified) {
      return NextResponse.json({ error: 'Security verification failed.' }, { status: 401 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        failedLoginAttempts: 0, // Reset lockout if they reset password
        lockoutUntil: null 
      }
    });

    return NextResponse.json({ message: 'Password successfully reset.' });

  } catch (err: any) {
    console.error('Password Reset Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
