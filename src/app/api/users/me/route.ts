import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateProfileSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest } from '@/lib/api/auth';

// Get current user profile
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

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId as string),
      with: {
        tenant: true,
      },
    });

    if (!user) {
      return errors.notFound('User');
    }

    return successResponse({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar: user.avatar,
      tenant: {
        id: user.tenant?.id,
        name: user.tenant?.name,
      },
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errors.internal('Failed to get profile');
  }
}

// Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return errors.unauthorized();
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return errors.unauthorized();
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.phone) updateData.phone = parsed.data.phone;
    if (parsed.data.department) updateData.department = parsed.data.department;

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, payload.userId as string))
      .returning();

    if (updatedUser.length === 0) {
      return errors.notFound('User');
    }

    return successResponse({
      id: updatedUser[0].id,
      username: updatedUser[0].username,
      name: updatedUser[0].name,
      role: updatedUser[0].role,
      department: updatedUser[0].department,
      phone: updatedUser[0].phone,
      avatar: updatedUser[0].avatar,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return errors.internal('Failed to update profile');
  }
}