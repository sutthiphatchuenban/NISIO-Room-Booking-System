import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms, users } from '@/lib/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';
import { successResponse, errors, createMeta } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Get pending approvals (Manager/Admin only)
export async function GET(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return errors.unauthorized();
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return errors.unauthorized();
    }

    // Check role
    if (!hasRole(payload.role as string, ['manager', 'admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [
      eq(bookings.tenantId, payload.tenantId as string),
      eq(bookings.status, 'pending'),
    ];

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(and(...conditions));

    const total = Number(countResult[0].value);

    // Get pending bookings with details
    const pendingBookings = await db
      .select({
        id: bookings.id,
        title: bookings.title,
        description: bookings.description,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        createdAt: bookings.createdAt,
        roomId: bookings.roomId,
        roomName: rooms.name,
        roomType: rooms.type,
        roomLocation: rooms.location,
        userId: bookings.userId,
        userName: users.name,
        userUsername: users.username,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return successResponse(pendingBookings, createMeta(page, limit, total));
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return errors.internal('Failed to get pending approvals');
  }
}