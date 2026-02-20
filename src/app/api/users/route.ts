import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';
import { listUsersSchema } from '@/lib/validations';
import { successResponse, errors, createMeta } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// List all users (Admin only)
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

    // Check role
    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') as any || undefined,
      department: searchParams.get('department') || undefined,
    };

    const parsed = listUsersSchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, limit, search, role, department } = parsed.data;

    // Build conditions
    const conditions = [eq(users.tenantId, payload.tenantId as string)];

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (department) {
      conditions.push(eq(users.department, department));
    }

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.username, `%${search}%`)
        )!
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    const total = Number(countResult[0].count);

    // Get users
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        department: users.department,
        phone: users.phone,
        avatar: users.avatar,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit);

    return successResponse(userList, createMeta(page, limit, total));
  } catch (error) {
    console.error('List users error:', error);
    return errors.internal('Failed to list users');
  }
}