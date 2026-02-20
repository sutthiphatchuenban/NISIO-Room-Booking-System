import { db } from '@/lib/db';
import { approvalRules, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getDay, format } from 'date-fns';

interface CheckAutoApprovalParams {
  roomId: string;
  userId: string;
  duration: number; // minutes
  startTime: Date;
  tenantId: string;
}

export async function checkAutoApproval({
  roomId,
  userId,
  duration,
  startTime,
  tenantId,
}: CheckAutoApprovalParams): Promise<boolean> {
  // Get user details
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return false;
  }

  // Get approval rules for this tenant
  const rules = await db
    .select()
    .from(approvalRules)
    .where(and(
      eq(approvalRules.tenantId, tenantId),
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

    // Check user exceptions first
    const allowedRoles = exceptions?.allowedRoles as string[] | undefined;
    if (allowedRoles && allowedRoles.includes(user.role)) {
      return true;
    }

    const allowedUserIds = exceptions?.allowedUserIds as string[] | undefined;
    if (allowedUserIds && allowedUserIds.includes(userId)) {
      return true;
    }

    const deniedUserIds = exceptions?.deniedUserIds as string[] | undefined;
    if (deniedUserIds && deniedUserIds.includes(userId)) {
      continue; // User is denied, skip this rule
    }

    // Check conditions
    const maxDuration = conditions?.maxDuration as number | undefined;
    if (maxDuration && duration > maxDuration) {
      continue;
    }

    const maxAdvanceDays = conditions?.maxAdvanceDays as number | undefined;
    if (maxAdvanceDays) {
      const daysInAdvance = (startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysInAdvance > maxAdvanceDays) {
        continue;
      }
    }

    const allowedDays = conditions?.allowedDays as string[] | undefined;
    if (allowedDays) {
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayName = dayNames[getDay(startTime)];
      if (!allowedDays.includes(dayName)) {
        continue;
      }
    }

    const allowedTimeStart = conditions?.allowedTimeStart as string | undefined;
    const allowedTimeEnd = conditions?.allowedTimeEnd as string | undefined;
    if (allowedTimeStart && allowedTimeEnd) {
      const timeStr = format(startTime, 'HH:mm');
      if (timeStr < allowedTimeStart || timeStr > allowedTimeEnd) {
        continue;
      }
    }

    // All conditions met - auto approve
    return true;
  }

  // No matching rule found
  return false;
}