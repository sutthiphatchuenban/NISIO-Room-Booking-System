import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { bookings, approvals } from '@/lib/db/schema';
import { eq, and, gte, count, avg, sql } from 'drizzle-orm';
import { startOfDay } from 'date-fns';
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

    // Admin only
    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const today = startOfDay(new Date());

    // Pending count
    const pendingResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          eq(bookings.status, 'pending')
        )
      );

    // Today's approved
    const todayApprovedResult = await db
      .select({ value: count() })
      .from(approvals)
      .where(
        and(
          eq(approvals.status, 'approved'),
          gte(approvals.respondedAt, today)
        )
      );

    // Today's rejected
    const todayRejectedResult = await db
      .select({ value: count() })
      .from(approvals)
      .where(
        and(
          eq(approvals.status, 'rejected'),
          gte(approvals.respondedAt, today)
        )
      );

    // Auto approval rate (bookings that went from pending to confirmed without approval record)
    const totalConfirmedResult = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, payload.tenantId as string),
          eq(bookings.status, 'confirmed')
        )
      );

    const manualApprovedResult = await db
      .select({ value: count() })
      .from(approvals)
      .where(eq(approvals.status, 'approved'));

    const totalConfirmed = Number(totalConfirmedResult[0].value);
    const manualApproved = Number(manualApprovedResult[0].value);
    const autoApproved = totalConfirmed - manualApproved;
    const autoApprovalRate = totalConfirmed > 0 ? (autoApproved / totalConfirmed) * 100 : 0;

    // Average approval time (in minutes)
    const avgApprovalTimeResult = await db
      .select({
        value: sql<number>`AVG(EXTRACT(EPOCH FROM (${approvals.respondedAt} - ${approvals.createdAt})) / 60)`,
      })
      .from(approvals)
      .where(
        and(
          eq(approvals.status, 'approved'),
          sql`${approvals.respondedAt} IS NOT NULL`
        )
      );

    return successResponse({
      pendingCount: Number(pendingResult[0].value),
      todayApproved: Number(todayApprovedResult[0].value),
      todayRejected: Number(todayRejectedResult[0].value),
      autoApprovalRate: Math.round(autoApprovalRate * 100) / 100,
      averageApprovalTime: Math.round(avgApprovalTimeResult[0].value || 0),
    });
  } catch (error) {
    console.error('Get approval stats error:', error);
    return errors.internal('Failed to get approval stats');
  }
}