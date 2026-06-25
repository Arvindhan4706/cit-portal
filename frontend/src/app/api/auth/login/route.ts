import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Simple in-memory rate limiter for serverless environment
// Note: Resets on cold start, but effective against immediate flood attacks
const rateLimit = new Map<string, { attempts: number; lockoutUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const limit = rateLimit.get(ip);
    if (limit && limit.lockoutUntil > Date.now()) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const body = await req.json();
    const { email, password, expectedRole } = body;

    // Sanitize input length
    if (password.length > 50) {
      return NextResponse.json({ error: 'Password is too long.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    const handleFailedLogin = () => {
      const current = rateLimit.get(ip) || { attempts: 0, lockoutUntil: 0 };
      const newAttempts = current.attempts + 1;
      if (newAttempts >= 5) {
        rateLimit.set(ip, { attempts: newAttempts, lockoutUntil: Date.now() + 15 * 60 * 1000 });
      } else {
        rateLimit.set(ip, { attempts: newAttempts, lockoutUntil: 0 });
      }
    };

    if (!user) {
      handleFailedLogin();
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.role !== expectedRole) {
      handleFailedLogin();
      return NextResponse.json({ error: `Unauthorized: You are not a ${expectedRole}` }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      handleFailedLogin();
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Successful login - reset attempts
    rateLimit.delete(ip);

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
