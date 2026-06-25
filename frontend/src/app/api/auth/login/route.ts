import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, expectedRole } = body;

    // Sanitize input length
    if (password.length > 50) {
      return NextResponse.json({ error: 'Password is too long.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // In a real app, don't reveal if user exists or not, but for now we follow the existing logic
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.role !== expectedRole) {
      return NextResponse.json({ error: `Unauthorized: You are not a ${expectedRole}` }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return NextResponse.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
