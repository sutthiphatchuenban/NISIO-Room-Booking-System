import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { amenities } from '@/lib/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { createAmenitySchema, updateAmenitySchema, paginationSchema } from '@/lib/validations';
import { successResponse, errors, createMeta } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// List all amenities
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

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '100',
    };

    const parsed = paginationSchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, limit } = parsed.data;

    const conditions = [eq(amenities.tenantId, payload.tenantId as string)];

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(amenities)
      .where(and(...conditions));

    const total = Number(countResult[0].value);

    // Get amenities
    const amenityList = await db
      .select({
        id: amenities.id,
        name: amenities.name,
        icon: amenities.icon,
        description: amenities.description,
        createdAt: amenities.createdAt,
      })
      .from(amenities)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit);

    return successResponse(amenityList, createMeta(page, limit, total));
  } catch (error) {
    console.error('List amenities error:', error);
    return errors.internal('Failed to list amenities');
  }
}

// Create amenity (Admin only)
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
    const parsed = createAmenitySchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;

    const newAmenity = await db
      .insert(amenities)
      .values({
        tenantId: payload.tenantId as string,
        name: data.name,
        icon: data.icon,
        description: data.description,
      })
      .returning();

    return successResponse(newAmenity[0]);
  } catch (error) {
    console.error('Create amenity error:', error);
    return errors.internal('Failed to create amenity');
  }
}