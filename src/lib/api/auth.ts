import { jwtVerify, SignJWT } from 'jose';
import { errorResponse } from './response';
import type { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Verify JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// Generate JWT token
export async function generateToken(payload: Record<string, unknown>, expiresIn: string = '24h') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

// Extract token from request
export async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy = ['user', 'manager', 'admin', 'super_admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  
  return requiredRoles.some((role) => {
    const requiredIndex = roleHierarchy.indexOf(role);
    return userRoleIndex >= requiredIndex;
  });
}

// Require authentication
export async function requireAuth(request: NextRequest) {
  const token = await getTokenFromRequest(request);
  if (!token) {
    return { error: errorResponse('UNAUTHORIZED', 'Authentication required', 401) };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: errorResponse('UNAUTHORIZED', 'Invalid token', 401) };
  }

  return { payload };
}

// Require specific role
export async function requireRole(request: NextRequest, requiredRoles: string[]) {
  const { payload, error } = await requireAuth(request);
  if (error) return { error };
  
  if (!hasRole(payload!.role as string, requiredRoles)) {
    return { error: errorResponse('FORBIDDEN', 'Insufficient permissions', 403) };
  }
  
  return { payload: payload! };
}