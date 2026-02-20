import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { successResponse, errors } from '@/lib/api/response';
import { getTokenFromRequest, verifyToken } from '@/lib/api/auth';

const updateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(100).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

// GET /api/settings/tenant - Get current tenant settings
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

    const tenantId = payload.tenantId as string;

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      return errors.notFound('Tenant');
    }

    return successResponse({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      settings: tenant.settings || {},
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    });
  } catch (error) {
    console.error('Get tenant settings error:', error);
    return errors.internal('Failed to get tenant settings');
  }
}

// PATCH /api/settings/tenant - Update tenant settings
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

    // Only admin can update tenant settings
    const role = payload.role as string;
    if (role !== 'admin') {
      return errors.forbidden('Only admin can update tenant settings');
    }

    const tenantId = payload.tenantId as string;

    const body = await request.json();
    const parsed = updateTenantSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.name) {
      updateData.name = parsed.data.name;
    }

    if (parsed.data.slug) {
      // Check if slug is already taken
      const existing = await db.query.tenants.findFirst({
        where: eq(tenants.slug, parsed.data.slug),
      });

      if (existing && existing.id !== tenantId) {
        return errors.conflict('Slug already taken');
      }

      updateData.slug = parsed.data.slug;
    }

    if (parsed.data.settings) {
      updateData.settings = parsed.data.settings;
    }

    await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, tenantId));

    const updatedTenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    return successResponse({
      id: updatedTenant!.id,
      name: updatedTenant!.name,
      slug: updatedTenant!.slug,
      settings: updatedTenant!.settings || {},
      createdAt: updatedTenant!.createdAt,
      updatedAt: updatedTenant!.updatedAt,
    });
  } catch (error) {
    console.error('Update tenant settings error:', error);
    return errors.internal('Failed to update tenant settings');
  }
}
