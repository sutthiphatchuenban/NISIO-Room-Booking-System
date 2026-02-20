import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms } from '@/lib/db/schema';
import { eq, and, gte, asc } from 'drizzle-orm';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest } from '@/lib/api/auth';

// Get upcoming bookings for current user
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

    const now = new Date();

    const upcomingBookings = await db
      .select({
        id: bookings.id,
        title: bookings.title,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        roomId: bookings.roomId,
        roomName: rooms.name,
        roomType: rooms.type,
        roomLocation: rooms.location,
        checkedInAt: bookings.checkedInAt,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          eq(bookings.userId, payload.userId as string),
          gte(bookings.startTime, now),
          eq(bookings.status, 'confirmed')
        )
      )
      .orderBy(asc(bookings.startTime))
      .limit(10);

    return successResponse(upcomingBookings);
  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    return errors.internal('Failed to get upcoming bookings');
  }
}