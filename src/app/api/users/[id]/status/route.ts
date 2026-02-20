import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateUserStatusSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Update user active status (Admin only)
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

    // Check if admin or super_admin
    if (!hasRole(payload.role as string, ['admin', 'super_admin'])) {
      return errors.forbidden();
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserStatusSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { isActive } = parsed.data;

    // Cannot deactivate yourself (prevent locking yourself out)
    if (id === payload.sub && !isActive) {
      return errors.forbidden('Cannot deactivate your own account');
    }

    // Check if user exists and belongs to same tenant
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return errors.notFound('User');
    }

    if (existingUser.tenantId !== payload.tenantId) {
      return errors.forbidden();
    }

    // Only super_admin can deactivate other admins
    if (existingUser.role === 'admin' && payload.role !== 'super_admin') {
      return errors.forbidden('Only super admin can modify admin accounts');
    }

    // Update user status
    const [updatedUser] = await db
      .update(users)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        department: users.department,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return successResponse(updatedUser);
  } catch (error) {
    console.error('Update user status error:', error);
    return errors.internal('Failed to update user status');
  }
}
