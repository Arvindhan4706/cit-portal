import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
  }
  return secret;
};

export const authenticate = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized: Invalid token format');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (err) {
    throw new Error('Unauthorized: Invalid or expired token');
  }
};

export const authorize = (req: NextRequest, allowedRoles: string[]) => {
  const user = authenticate(req);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  return user;
};

// Helper for sending error responses consistently
export const authErrorResponse = (err: any) => {
  const message = err.message || 'Internal Server Error';
  if (message.startsWith('Unauthorized')) {
    return NextResponse.json({ error: message }, { status: 401 });
  }
  if (message.startsWith('Forbidden')) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
};
