import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { approvalRules } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateApprovalRuleSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Update auto approval rule (Admin only)
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

    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = updateApprovalRuleSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.roomId !== undefined) updateData.roomId = data.roomId;
    if (data.name) updateData.name = data.name;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.conditions) updateData.conditions = data.conditions;
    if (data.userExceptions) updateData.userExceptions = data.userExceptions;
    if (data.priority !== undefined) updateData.priority = data.priority;

    const updatedRule = await db
      .update(approvalRules)
      .set(updateData)
      .where(and(
        eq(approvalRules.id, id),
        eq(approvalRules.tenantId, payload.tenantId as string)
      ))
      .returning();

    if (updatedRule.length === 0) {
      return errors.notFound('Approval rule');
    }

    return successResponse(updatedRule[0]);
  } catch (error) {
    console.error('Update approval rule error:', error);
    return errors.internal('Failed to update approval rule');
  }
}

// Delete auto approval rule (Admin only)
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

    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const { id } = await params;

    const deletedRule = await db
      .delete(approvalRules)
      .where(and(
        eq(approvalRules.id, id),
        eq(approvalRules.tenantId, payload.tenantId as string)
      ))
      .returning();

    if (deletedRule.length === 0) {
      return errors.notFound('Approval rule');
    }

    return successResponse({ message: 'Approval rule deleted successfully' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    return errors.internal('Failed to delete approval rule');
  }
}