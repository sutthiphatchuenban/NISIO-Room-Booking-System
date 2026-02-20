import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms } from '@/lib/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { successResponse, errors, createMeta } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest } from '@/lib/api/auth';

// Get current user's bookings
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conditions = [
      eq(bookings.tenantId, payload.tenantId as string),
      eq(bookings.userId, payload.userId as string),
    ];

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(and(...conditions));

    const total = Number(countResult[0].value);

    // Get bookings
    const bookingList = await db
      .select({
        id: bookings.id,
        title: bookings.title,
        description: bookings.description,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        roomId: bookings.roomId,
        roomName: rooms.name,
        roomType: rooms.type,
        roomLocation: rooms.location,
        checkedInAt: bookings.checkedInAt,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.startTime))
      .limit(limit)
      .offset((page - 1) * limit);

    return successResponse(bookingList, createMeta(page, limit, total));
  } catch (error) {
    console.error('Get my bookings error:', error);
    return errors.internal('Failed to get bookings');
  }
}