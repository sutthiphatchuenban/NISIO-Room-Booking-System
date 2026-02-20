import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, rooms } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateBookingSchema, cancelBookingSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Get booking details
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

    const booking = await db
      .select({
        id: bookings.id,
        title: bookings.title,
        description: bookings.description,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        recurrenceType: bookings.recurrenceType,
        recurrenceEndDate: bookings.recurrenceEndDate,
        checkedInAt: bookings.checkedInAt,
        cancellationReason: bookings.cancellationReason,
        createdAt: bookings.createdAt,
        userId: bookings.userId,
        roomId: bookings.roomId,
        roomName: rooms.name,
        roomType: rooms.type,
        roomLocation: rooms.location,
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(
        and(
          eq(bookings.id, id),
          eq(bookings.tenantId, payload.tenantId as string)
        )
      );

    if (booking.length === 0) {
      return errors.notFound('Booking');
    }

    // Check if user can view this booking
    if (
      booking[0].userId !== payload.userId &&
      !hasRole(payload.role as string, ['admin', 'super_admin', 'manager'])
    ) {
      return errors.forbidden();
    }

    return successResponse(booking[0]);
  } catch (error) {
    console.error('Get booking error:', error);
    return errors.internal('Failed to get booking');
  }
}

// Update booking
export async function PATCH(
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

    // Get existing booking
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, id),
        eq(bookings.tenantId, payload.tenantId as string)
      ),
    });

    if (!existingBooking) {
      return errors.notFound('Booking');
    }

    // Check ownership/permissions
    if (
      existingBooking.userId !== payload.userId &&
      !hasRole(payload.role as string, ['admin', 'super_admin'])
    ) {
      return errors.forbidden();
    }

    // Cannot modify past bookings
    if (new Date(existingBooking.startTime) < new Date()) {
      return errors.conflict('Cannot modify past bookings');
    }

    const body = await request.json();
    const parsed = updateBookingSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);

    const updatedBooking = await db
      .update(bookings)
      .set(updateData)
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, payload.tenantId as string)))
      .returning();

    return successResponse(updatedBooking[0]);
  } catch (error) {
    console.error('Update booking error:', error);
    return errors.internal('Failed to update booking');
  }
}

// Cancel booking
export async function DELETE(
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

    // Get existing booking
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, id),
        eq(bookings.tenantId, payload.tenantId as string)
      ),
    });

    if (!existingBooking) {
      return errors.notFound('Booking');
    }

    // Check ownership/permissions
    if (
      existingBooking.userId !== payload.userId &&
      !hasRole(payload.role as string, ['admin', 'super_admin'])
    ) {
      return errors.forbidden();
    }

    // Cannot cancel past bookings
    if (new Date(existingBooking.endTime) < new Date()) {
      return errors.conflict('Cannot cancel past bookings');
    }

    // Get cancellation reason from body if provided
    let reason: string | undefined;
    try {
      const body = await request.json();
      const parsed = cancelBookingSchema.safeParse(body);
      if (parsed.success) {
        reason = parsed.data.reason;
      }
    } catch {
      // No body provided, that's ok
    }

    const cancelledBooking = await db
      .update(bookings)
      .set({
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: payload.userId as string,
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, payload.tenantId as string)))
      .returning();

    return successResponse(cancelledBooking[0]);
  } catch (error) {
    console.error('Cancel booking error:', error);
    return errors.internal('Failed to cancel booking');
  }
}