import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { amenities } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateAmenitySchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Update amenity (Admin only)
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
    const parsed = updateAmenitySchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = data.name;
    if (data.icon) updateData.icon = data.icon;
    if (data.description !== undefined) updateData.description = data.description;

    const updatedAmenity = await db
      .update(amenities)
      .set(updateData)
      .where(and(
        eq(amenities.id, id),
        eq(amenities.tenantId, payload.tenantId as string)
      ))
      .returning();

    if (updatedAmenity.length === 0) {
      return errors.notFound('Amenity');
    }

    return successResponse(updatedAmenity[0]);
  } catch (error) {
    console.error('Update amenity error:', error);
    return errors.internal('Failed to update amenity');
  }
}

// Delete amenity (Admin only)
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

    const deletedAmenity = await db
      .delete(amenities)
      .where(and(
        eq(amenities.id, id),
        eq(amenities.tenantId, payload.tenantId as string)
      ))
      .returning();

    if (deletedAmenity.length === 0) {
      return errors.notFound('Amenity');
    }

    return successResponse({ message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error('Delete amenity error:', error);
    return errors.internal('Failed to delete amenity');
  }
}