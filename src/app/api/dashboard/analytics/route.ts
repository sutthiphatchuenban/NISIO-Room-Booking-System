import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms } from '@/lib/db/schema';
import { eq, and, gte, lte, count, avg, sql } from 'drizzle-orm';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, getHours } from 'date-fns';
import { analyticsSchema } from '@/lib/validations';
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

    // Analytics only for admin/manager
    if (!hasRole(payload.role as string, ['admin', 'super_admin', 'manager'])) {
      return errors.forbidden();
    }

    const { searchParams } = new URL(request.url);
    const params = {
      period: (searchParams.get('period') as 'day' | 'week' | 'month' | 'year') || 'month',
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };

    const parsed = analyticsSchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { period, from, to } = parsed.data;
    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      switch (period) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
      }
    }

    // Total bookings in period
    const totalBookingsResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, startDate),
          lte(bookings.startTime, endDate)
        )
      );

    // Cancelled bookings
    const cancelledBookingsResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, startDate),
          lte(bookings.startTime, endDate),
          eq(bookings.status, 'cancelled')
        )
      );

    // Average duration
    const avgDurationResult = await db
      .select({
        value: sql<number>`AVG(EXTRACT(EPOCH FROM (${bookings.endTime} - ${bookings.startTime})) / 60)`,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, startDate),
          lte(bookings.startTime, endDate),
          eq(bookings.status, 'confirmed')
        )
      );

    // Bookings by hour (peak hours) - convert to Bangkok timezone (UTC+7)
    const bookingsByHour = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM (${bookings.startTime} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'))`,
        count: count(),
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, startDate),
          lte(bookings.startTime, endDate),
          eq(bookings.status, 'confirmed')
        )
      )
      .groupBy(sql`EXTRACT(HOUR FROM (${bookings.startTime} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'))`)
      .orderBy(sql`EXTRACT(HOUR FROM (${bookings.startTime} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok'))`);

    // Utilization by room type
    const utilizationByType = await db
      .select({
        type: rooms.type,
        bookings: count(),
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, startDate),
          lte(bookings.startTime, endDate),
          eq(bookings.status, 'confirmed')
        )
      )
      .groupBy(rooms.type);

    // Daily trend
    const dailyTrend = await db
      .select({
        date: sql<string>`DATE(${bookings.startTime})`,
        count: count(),
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          gte(bookings.startTime, startDate),
          lte(bookings.startTime, endDate),
          eq(bookings.status, 'confirmed')
        )
      )
      .groupBy(sql`DATE(${bookings.startTime})`)
      .orderBy(sql`DATE(${bookings.startTime})`);

    return successResponse({
      period,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      bookings: {
        total: Number(totalBookingsResult[0].value),
        cancelled: Number(cancelledBookingsResult[0].value),
        averageDuration: Math.round(avgDurationResult[0].value || 0),
      },
      peakHours: bookingsByHour.map((b) => ({
        hour: b.hour,
        bookings: Number(b.count),
      })),
      utilizationByType: utilizationByType.map((u) => ({
        type: u.type,
        bookings: Number(u.bookings),
      })),
      trend: dailyTrend.map((d) => ({
        date: d.date,
        bookings: Number(d.count),
      })),
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return errors.internal('Failed to get analytics');
  }
}