import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { rooms, bookings } from '@/lib/db/schema';
import { eq, and, gte, lte, or, ne } from 'drizzle-orm';
import { roomAvailabilitySchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest } from '@/lib/api/auth';
import { addMinutes, format, parseISO } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return errors.unauthorized();
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return errors.unauthorized();
    }

    const { id } = await params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params_data = {
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
    };

    const parsed = roomAvailabilitySchema.safeParse(params_data);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { from, to } = parsed.data;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Verify room exists
    const room = await db.query.rooms.findFirst({
      where: and(
        eq(rooms.id, id),
        eq(rooms.tenantId, payload.tenantId as string)
      ),
    });

    if (!room) {
      return errors.notFound('Room');
    }

    // Get existing bookings for the date range
    const existingBookings = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, id),
          ne(bookings.status, 'cancelled'),
          ne(bookings.status, 'rejected'),
          or(
            and(
              gte(bookings.startTime, fromDate),
              lte(bookings.startTime, toDate)
            ),
            and(
              gte(bookings.endTime, fromDate),
              lte(bookings.endTime, toDate)
            ),
            and(
              lte(bookings.startTime, fromDate),
              gte(bookings.endTime, toDate)
            )
          )
        )
      );

    // Generate availability slots (hourly)
    const slots = [];
    const currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const daySlots = [];
      const dayStart = new Date(currentDate);
      dayStart.setHours(8, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(18, 0, 0, 0);

      let slotTime = new Date(dayStart);

      while (slotTime < dayEnd) {
        const slotEnd = addMinutes(slotTime, 60);

        // Check if slot conflicts with any booking
        const isBooked = existingBookings.some((booking) => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return (
            (slotTime >= bookingStart && slotTime < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotTime <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        daySlots.push({
          start: format(slotTime, 'HH:mm'),
          end: format(slotEnd, 'HH:mm'),
          available: !isBooked,
        });

        slotTime = slotEnd;
      }

      slots.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        availableSlots: daySlots,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return successResponse({
      roomId: id,
      dateRange: { from, to },
      slots,
    });
  } catch (error) {
    console.error('Get availability error:', error);
    return errors.internal('Failed to get availability');
  }
}