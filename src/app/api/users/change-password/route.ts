import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest } from '@/lib/api/auth';
import { z } from 'zod';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100),
});

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

        const body = await request.json();
        const parsed = changePasswordSchema.safeParse(body);

        if (!parsed.success) {
            return errors.validation(parsed.error);
        }

        const { currentPassword, newPassword } = parsed.data;

        // Get user with password hash
        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.userId as string),
        });

        if (!user || !user.passwordHash) {
            return errors.notFound('User');
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return errorResponse('BAD_REQUEST', 'รหัสผ่านปัจจุบันไม่ถูกต้อง', 400);
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Update password
        await db
            .update(users)
            .set({
                passwordHash: newPasswordHash,
                updatedAt: new Date(),
            })
            .where(eq(users.id, payload.userId as string));

        return successResponse({ message: 'เปลี่ยนรหัสผ่านเรียบร้อย' });
    } catch (error) {
        console.error('Change password error:', error);
        return errors.internal('Failed to change password');
    }
}
