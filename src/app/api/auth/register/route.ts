import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { registerSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { username, password, name, tenantSlug } = parsed.data;

    // Check if username exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUser) {
      return errors.conflict('Username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    let tenantId: string;

    // Handle tenant
    if (tenantSlug) {
      // Join existing tenant
      const existingTenant = await db.query.tenants.findFirst({
        where: eq(tenants.slug, tenantSlug),
      });

      if (!existingTenant) {
        return errors.notFound('Tenant');
      }
      tenantId = existingTenant.id;
    } else {
      // Create new tenant
      const newTenant = await db.insert(tenants).values({
        name: `${name}'s Organization`,
        slug: `org-${Date.now()}`,
      }).returning();

      tenantId = newTenant[0].id;
    }

    // Create user
    const newUser = await db.insert(users).values({
      username,
      passwordHash,
      name,
      tenantId,
      role: 'admin', // First user becomes admin
    }).returning();

    return successResponse({
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        name: newUser[0].name,
        role: newUser[0].role,
        tenantId: newUser[0].tenantId,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return errors.internal('Failed to register');
  }
}