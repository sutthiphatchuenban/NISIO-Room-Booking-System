import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms } from '@/lib/db/schema';
import { eq, and, gte, lte, count, desc, sql } from 'drizzle-orm';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest } from '@/lib/api/auth';

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
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    // Today's stats
    const todayBookingsResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, todayStart),
          lte(bookings.startTime, todayEnd),
          eq(bookings.status, 'confirmed')
        )
      );

    const activeNowResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          lte(bookings.startTime, now),
          gte(bookings.endTime, now),
          eq(bookings.status, 'confirmed')
        )
      );

    const upcomingTodayResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, now),
          lte(bookings.startTime, todayEnd),
          eq(bookings.status, 'confirmed')
        )
      );

    // This week's stats
    const weekBookingsResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, weekStart),
          lte(bookings.startTime, weekEnd),
          eq(bookings.status, 'confirmed')
        )
      );

    // Top rooms this week
    const topRooms = await db
      .select({
        roomId: bookings.roomId,
        name: rooms.name,
        bookings: count(),
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, weekStart),
          lte(bookings.startTime, weekEnd),
          eq(bookings.status, 'confirmed')
        )
      )
      .groupBy(bookings.roomId, rooms.name)
      .orderBy(desc(count()))
      .limit(5);

    // My bookings stats
    const myTotalResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          eq(bookings.userId, payload.userId as string)
        )
      );

    const myTodayResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          eq(bookings.userId, payload.userId as string),
          gte(bookings.startTime, todayStart),
          lte(bookings.startTime, todayEnd)
        )
      );

    const myWeekResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          eq(bookings.userId, payload.userId as string),
          gte(bookings.startTime, weekStart),
          lte(bookings.startTime, weekEnd)
        )
      );

    const myPendingResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          eq(bookings.userId, payload.userId as string),
          eq(bookings.status, 'pending')
        )
      );

    // Calculate utilization rate
    const totalRoomsResult = await db
      .select({ value: count() })
      .from(rooms)
      .where(
        and(
          eq(rooms.tenantId, payload.tenantId as string),
          eq(rooms.isActive, true)
        )
      );

    const totalRooms = Number(totalRoomsResult[0].value);
    const weekBookings = Number(weekBookingsResult[0].value);
    const utilizationRate = totalRooms > 0 ? Math.round((weekBookings / (totalRooms * 5)) * 100) : 0;

    return successResponse({
      today: {
        totalBookings: Number(todayBookingsResult[0].value),
        activeNow: Number(activeNowResult[0].value),
        upcoming: Number(upcomingTodayResult[0].value),
      },
      thisWeek: {
        totalBookings: weekBookings,
        utilizationRate,
        topRooms: topRooms.map((r) => ({
          roomId: r.roomId,
          name: r.name,
          bookings: Number(r.bookings),
        })),
      },
      myBookings: {
        total: Number(myTotalResult[0].value),
        today: Number(myTodayResult[0].value),
        thisWeek: Number(myWeekResult[0].value),
        pendingApproval: Number(myPendingResult[0].value),
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errors.internal('Failed to get dashboard stats');
  }
}