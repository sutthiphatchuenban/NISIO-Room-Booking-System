import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { approvalRules } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createApprovalRuleSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Create auto approval rule (Admin only)
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

    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const body = await request.json();
    const parsed = createApprovalRuleSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;

    const newRule = await db
      .insert(approvalRules)
      .values({
        tenantId: payload.tenantId as string,
        roomId: data.roomId,
        name: data.name,
        conditions: data.conditions,
        userExceptions: data.userExceptions,
        priority: data.priority,
      })
      .returning();

    return successResponse(newRule[0]);
  } catch (error) {
    console.error('Create approval rule error:', error);
    return errors.internal('Failed to create approval rule');
  }
}