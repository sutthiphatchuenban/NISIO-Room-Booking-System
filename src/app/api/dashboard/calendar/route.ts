import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms, users } from '@/lib/db/schema';
import { eq, and, gte, lte, ne } from 'drizzle-orm';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { calendarViewSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

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
    const params = {
      view: (searchParams.get('view') as 'day' | 'week' | 'month') || 'week',
      date: searchParams.get('date') || new Date().toISOString(),
      roomId: searchParams.get('roomId') || undefined,
    };

    const parsed = calendarViewSchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { view, date, roomId } = parsed.data;
    const refDate = date ? new Date(date) : new Date();

    let startDate: Date;
    let endDate: Date;

    switch (view) {
      case 'day':
        startDate = startOfDay(refDate);
        endDate = endOfDay(refDate);
        break;
      case 'week':
        startDate = startOfWeek(refDate);
        endDate = endOfWeek(refDate);
        break;
      case 'month':
        startDate = startOfMonth(refDate);
        endDate = endOfMonth(refDate);
        break;
    }

    const conditions = [
      eq(bookings.tenantId, payload.tenantId as string),
      gte(bookings.startTime, startDate),
      lte(bookings.startTime, endDate),
      ne(bookings.status, 'cancelled'),
    ];

    // Regular users can only see their own bookings or confirmed ones
    if (!hasRole(payload.role as string, ['admin', 'super_admin', 'manager'])) {
      conditions.push(eq(bookings.userId, payload.userId as string));
    }

    if (roomId) {
      conditions.push(eq(bookings.roomId, roomId));
    }

    const calendarBookings = await db
      .select({
        id: bookings.id,
        title: bookings.title,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        roomId: bookings.roomId,
        roomName: rooms.name,
        roomType: rooms.type,
        roomColor: rooms.color,
        userId: bookings.userId,
        userName: users.name,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(and(...conditions))
      .orderBy(bookings.startTime);

    return successResponse({
      view,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      bookings: calendarBookings,
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    return errors.internal('Failed to get calendar data');
  }
}