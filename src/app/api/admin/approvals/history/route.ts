import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, approvals, users, rooms } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, count, sql } from 'drizzle-orm';
import { approvalHistorySchema } from '@/lib/validations';
import { successResponse, errors, createMeta } from '@/lib/api/response';
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

    // Admin only
    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      status: searchParams.getAll('status'),
      approverId: searchParams.get('approverId') || undefined,
    };

    const parsed = approvalHistorySchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, limit, from, to, status, approverId } = parsed.data;

    const conditions = [];

    if (from) {
      conditions.push(gte(approvals.respondedAt, new Date(from)));
    }

    if (to) {
      conditions.push(lte(approvals.respondedAt, new Date(to)));
    }

    if (status && status.length > 0) {
      // Filter by approval status
      if (status.includes('auto_approved')) {
        // Auto-approved bookings don't have approval records
        // This is a simplified version - in production, you'd track auto-approvals differently
      }
    }

    if (approverId) {
      conditions.push(eq(approvals.approverId, approverId));
    }

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(approvals)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0].value);

    // Get approval history with details - using raw query for proper aliasing
    const historyQuery = await db.query.approvals.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        approver: true,
        booking: {
          with: {
            room: true,
            user: true,
          },
        },
      },
      orderBy: desc(approvals.respondedAt),
      limit,
      offset: (page - 1) * limit,
    });

    // Map to response format
    const history = historyQuery.map(item => ({
      id: item.id,
      status: item.status,
      comment: item.comment,
      respondedAt: item.respondedAt,
      createdAt: item.createdAt,
      approverId: item.approverId,
      approverName: item.approver?.name || 'ระบบอัตโนมัติ',
      bookingId: item.bookingId,
      bookingTitle: item.booking?.title || '-',
      roomName: item.booking?.room?.name || 'Unknown Room',
      requesterName: item.booking?.user?.name || '-',
    }));

    return successResponse(history, createMeta(page, limit, total));
  } catch (error) {
    console.error('Get approval history error:', error);
    return errors.internal('Failed to get approval history');
  }
}