import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, approvals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { approvalActionSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
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

    // Check role
    if (!hasRole(payload.role as string, ['manager', 'admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const { bookingId } = await params;

    // Get booking
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.tenantId, payload.tenantId as string)
      ),
    });

    if (!booking) {
      return errors.notFound('Booking');
    }

    if (booking.status !== 'pending') {
      return errors.conflict('Booking is not in pending status');
    }

    const body = await request.json();
    const parsed = approvalActionSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        status: 'confirmed',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Create approval record
    const approval = await db
      .insert(approvals)
      .values({
        bookingId,
        approverId: payload.userId as string,
        status: 'approved',
        comment: parsed.data.comment,
        respondedAt: new Date(),
      })
      .returning();

    return successResponse({
      message: 'Booking approved successfully',
      approval: approval[0],
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    return errors.internal('Failed to approve booking');
  }
}