import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { refreshTokenSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = refreshTokenSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { refreshToken } = parsed.data;

    // Verify refresh token
    const { payload } = await jwtVerify(refreshToken, JWT_SECRET);

    if (payload.type !== 'refresh') {
      return errors.unauthorized();
    }

    // Generate new access token
    const accessToken = await new SignJWT({
      userId: payload.userId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    return successResponse({
      accessToken,
      refreshToken, // Can rotate refresh token here
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch {
    return errors.unauthorized();
  }
}