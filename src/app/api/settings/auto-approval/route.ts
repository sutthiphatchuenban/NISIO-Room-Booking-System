import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { approvalRules, rooms } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Get auto approval rules (Admin only)
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

    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const rules = await db
      .select({
        id: approvalRules.id,
        roomId: approvalRules.roomId,
        roomName: rooms.name,
        name: approvalRules.name,
        enabled: approvalRules.enabled,
        conditions: approvalRules.conditions,
        userExceptions: approvalRules.userExceptions,
        priority: approvalRules.priority,
        createdAt: approvalRules.createdAt,
      })
      .from(approvalRules)
      .leftJoin(rooms, eq(approvalRules.roomId, rooms.id))
      .where(eq(approvalRules.tenantId, payload.tenantId as string))
      .orderBy(approvalRules.priority);

    return successResponse({
      enabled: rules.length > 0,
      rules,
    });
  } catch (error) {
    console.error('Get auto approval rules error:', error);
    return errors.internal('Failed to get auto approval rules');
  }
}