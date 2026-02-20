import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, ne, count, or, lt, gt } from 'drizzle-orm';
import { listBookingsSchema, createBookingSchema } from '@/lib/validations';
import { successResponse, errors, createMeta } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';
import { checkAutoApproval } from '@/lib/services/approval-service';

// List bookings
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
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.getAll('status'),
      roomId: searchParams.get('roomId') || undefined,
      userId: searchParams.get('userId') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      view: (searchParams.get('view') as 'list' | 'calendar') || 'list',
    };

    const parsed = listBookingsSchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, limit, status, roomId, userId, from, to } = parsed.data;

    const conditions = [eq(bookings.tenantId, payload.tenantId as string)];

    // Regular users can only see their own bookings unless they're admin/manager
    if (!hasRole(payload.role as string, ['admin', 'super_admin', 'manager'])) {
      conditions.push(eq(bookings.userId, payload.userId as string));
    } else if (userId) {
      // Admin can filter by specific user
      conditions.push(eq(bookings.userId, userId));
    }

    if (status && status.length > 0) {
      conditions.push(or(...status.map((s) => eq(bookings.status, s)))!);
    }

    if (roomId) {
      conditions.push(eq(bookings.roomId, roomId));
    }

    if (from) {
      conditions.push(gte(bookings.startTime, new Date(from)));
    }

    if (to) {
      conditions.push(lte(bookings.endTime, new Date(to)));
    }

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(and(...conditions));

    const total = Number(countResult[0].value);

    // Get bookings with room info
    const bookingList = await db
      .select({
        id: bookings.id,
        title: bookings.title,
        description: bookings.description,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        roomId: bookings.roomId,
        userId: bookings.userId,
        recurrenceType: bookings.recurrenceType,
        checkedInAt: bookings.checkedInAt,
        createdAt: bookings.createdAt,
        roomName: rooms.name,
        roomType: rooms.type,
        roomLocation: rooms.location,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(and(...conditions))
      .orderBy(desc(bookings.startTime))
      .limit(limit)
      .offset((page - 1) * limit);

    return successResponse(bookingList, createMeta(page, limit, total));
  } catch (error) {
    console.error('List bookings error:', error);
    return errors.internal('Failed to list bookings');
  }
}

// Create new booking
export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return errors.unauthorized();
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return errors.unauthorized();
    }

    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

    // Get room details
    const room = await db.query.rooms.findFirst({
      where: and(
        eq(rooms.id, data.roomId),
        eq(rooms.tenantId, payload.tenantId as string)
      ),
    });

    if (!room) {
      return errors.notFound('Room');
    }

    // Validate booking rules
    if (room.minBookingDuration !== null && duration < room.minBookingDuration) {
      return errors.validation({
        issues: [{ message: `Minimum booking duration is ${room.minBookingDuration} minutes`, path: ['endTime'] }],
        name: 'ZodError',
      } as any);
    }

    if (room.maxBookingDuration !== null && duration > room.maxBookingDuration) {
      return errors.validation({
        issues: [{ message: `Maximum booking duration is ${room.maxBookingDuration} minutes`, path: ['endTime'] }],
        name: 'ZodError',
      } as any);
    }

    // Check advance booking days
    const daysInAdvance = (startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (room.advanceBookingDays !== null && daysInAdvance > room.advanceBookingDays) {
      return errors.validation({
        issues: [{ message: `Cannot book more than ${room.advanceBookingDays} days in advance`, path: ['startTime'] }],
        name: 'ZodError',
      } as any);
    }

    // Check for conflicts
    // Two time ranges overlap when:
    // existing.start < new.end AND existing.end > new.start
    const conflicts = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, data.roomId),
          eq(bookings.tenantId, payload.tenantId as string),
          ne(bookings.status, 'cancelled'),
          ne(bookings.status, 'rejected'),
          lt(bookings.startTime, endTime),
          gt(bookings.endTime, startTime)
        )
      );

    if (conflicts.length > 0) {
      return errors.conflict('Room is not available for the selected time');
    }

    // Determine initial status
    let status: 'pending' | 'confirmed' = 'pending';

    // Check auto-approval rules
    if (!room.requiresApproval) {
      status = 'confirmed';
    } else if (room.autoApprovalEnabled) {
      const shouldAutoApprove = await checkAutoApproval({
        roomId: data.roomId,
        userId: payload.userId as string,
        duration,
        startTime,
        tenantId: payload.tenantId as string,
      });

      if (shouldAutoApprove) {
        status = 'confirmed';
      }
    }

    // Create booking
    const newBooking = await db
      .insert(bookings)
      .values({
        tenantId: payload.tenantId as string,
        userId: payload.userId as string,
        roomId: data.roomId,
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        status,
        recurrenceType: data.recurrence?.type || 'none',
        recurrenceEndDate: data.recurrence?.endDate ? new Date(data.recurrence.endDate) : null,
      })
      .returning();

    return successResponse({
      ...newBooking[0],
      autoApproved: status === 'confirmed' && room.requiresApproval,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return errors.internal('Failed to create booking');
  }
}