import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { checkInSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';
import { addMinutes, subMinutes } from 'date-fns';

export async function POST(
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

    // Get booking
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, id),
        eq(bookings.tenantId, payload.tenantId as string)
      ),
    });

    if (!booking) {
      return errors.notFound('Booking');
    }

    // Check ownership or admin
    if (
      booking.userId !== payload.userId &&
      !hasRole(payload.role as string, ['admin', 'super_admin', 'manager'])
    ) {
      return errors.forbidden();
    }

    // Check if already checked in
    if (booking.checkedInAt) {
      return errors.conflict('Already checked in');
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return errors.conflict('Cannot check in - booking is not confirmed');
    }

    // Check time window (15 minutes before to 30 minutes after start time)
    const startTime = new Date(booking.startTime);
    const now = new Date();
    const checkInWindowStart = subMinutes(startTime, 15);
    const checkInWindowEnd = addMinutes(startTime, 30);

    if (now < checkInWindowStart) {
      return errors.conflict('Too early to check in. Check-in opens 15 minutes before start time');
    }

    if (now > checkInWindowEnd) {
      return errors.conflict('Check-in window has closed');
    }

    // Parse body (for QR code if provided)
    let qrCode: string | undefined;
    try {
      const body = await request.json();
      const parsed = checkInSchema.safeParse(body);
      if (parsed.success) {
        qrCode = parsed.data.qrCode;
      }
    } catch {
      // No body, that's ok for manual check-in
    }

    const updatedBooking = await db
      .update(bookings)
      .set({
        checkedInAt: new Date(),
        checkedInBy: payload.userId as string,
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, payload.tenantId as string)))
      .returning();

    return successResponse({
      ...updatedBooking[0],
      message: 'Checked in successfully',
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return errors.internal('Failed to check in');
  }
}