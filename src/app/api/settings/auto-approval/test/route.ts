import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { approvalRules, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { testApprovalRuleSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';
import { format, getDay } from 'date-fns';

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
    const parsed = testApprovalRuleSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { roomId, userId, duration, startTime } = parsed.data;
    const startDate = new Date(startTime);

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return errors.notFound('User');
    }

    // Get approval rules for this tenant
    const rules = await db
      .select()
      .from(approvalRules)
      .where(and(
        eq(approvalRules.tenantId, payload.tenantId as string),
        eq(approvalRules.enabled, true)
      ))
      .orderBy(desc(approvalRules.priority));

    // Check each rule
    for (const rule of rules) {
      // Skip if rule is for a specific room and doesn't match
      if (rule.roomId && rule.roomId !== roomId) {
        continue;
      }

      const conditions = rule.conditions as Record<string, unknown>;
      const exceptions = rule.userExceptions as Record<string, unknown>;

      // Check user exceptions
      const allowedRoles = exceptions?.allowedRoles as string[] | undefined;
      if (allowedRoles && allowedRoles.includes(user.role)) {
        return successResponse({
          wouldAutoApprove: true,
          matchedRule: {
            id: rule.id,
            name: rule.name,
          },
          reason: `User role '${user.role}' is in allowed roles list`,
        });
      }

      const allowedUserIds = exceptions?.allowedUserIds as string[] | undefined;
      if (allowedUserIds && allowedUserIds.includes(userId)) {
        return successResponse({
          wouldAutoApprove: true,
          matchedRule: {
            id: rule.id,
            name: rule.name,
          },
          reason: 'User is in allowed users list',
        });
      }

      const deniedUserIds = exceptions?.deniedUserIds as string[] | undefined;
      if (deniedUserIds && deniedUserIds.includes(userId)) {
        continue; // Skip this rule for denied users
      }

      // Check conditions
      const maxDuration = conditions?.maxDuration as number | undefined;
      if (maxDuration && duration > maxDuration) {
        continue;
      }

      const maxAdvanceDays = conditions?.maxAdvanceDays as number | undefined;
      if (maxAdvanceDays) {
        const daysInAdvance = (startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysInAdvance > maxAdvanceDays) {
          continue;
        }
      }

      const allowedDays = conditions?.allowedDays as string[] | undefined;
      if (allowedDays) {
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayName = dayNames[getDay(startDate)];
        if (!allowedDays.includes(dayName)) {
          continue;
        }
      }

      const allowedTimeStart = conditions?.allowedTimeStart as string | undefined;
      const allowedTimeEnd = conditions?.allowedTimeEnd as string | undefined;
      if (allowedTimeStart && allowedTimeEnd) {
        const timeStr = format(startDate, 'HH:mm');
        if (timeStr < allowedTimeStart || timeStr > allowedTimeEnd) {
          continue;
        }
      }

      // All conditions met
      return successResponse({
        wouldAutoApprove: true,
        matchedRule: {
          id: rule.id,
          name: rule.name,
        },
        reason: buildReason(conditions, duration, startDate),
      });
    }

    return successResponse({
      wouldAutoApprove: false,
      matchedRule: null,
      reason: 'No matching auto-approval rules',
    });
  } catch (error) {
    console.error('Test approval rule error:', error);
    return errors.internal('Failed to test approval rule');
  }
}

function buildReason(conditions: Record<string, unknown>, duration: number, startDate: Date): string {
  const parts: string[] = [];

  const maxDuration = conditions?.maxDuration as number | undefined;
  if (maxDuration) {
    parts.push(`Duration ${duration} mins <= ${maxDuration}`);
  }

  const allowedDays = conditions?.allowedDays as string[] | undefined;
  if (allowedDays) {
    parts.push(`Allowed days: ${allowedDays.join(', ')}`);
  }

  const allowedTimeStart = conditions?.allowedTimeStart as string | undefined;
  const allowedTimeEnd = conditions?.allowedTimeEnd as string | undefined;
  if (allowedTimeStart && allowedTimeEnd) {
    parts.push(`Business hours ${allowedTimeStart}-${allowedTimeEnd}`);
  }

  return parts.join(', ') || 'All conditions met';
}