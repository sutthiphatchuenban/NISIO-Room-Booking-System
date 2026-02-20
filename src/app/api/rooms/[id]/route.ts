import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { rooms, roomAmenities } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateRoomSchema } from '@/lib/validations';
import { successResponse, errors } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// Get room details
export async function GET(
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

    const { id } = await params;

    const room = await db.query.rooms.findFirst({
      where: and(
        eq(rooms.id, id),
        eq(rooms.tenantId, payload.tenantId as string)
      ),
    });

    if (!room) {
      return errors.notFound('Room');
    }

    return successResponse(room);
  } catch (error) {
    console.error('Get room error:', error);
    return errors.internal('Failed to get room');
  }
}

// Update room (Admin only)
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
    const parsed = updateRoomSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.capacity) updateData.capacity = data.capacity;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.floor !== undefined) updateData.floor = data.floor;
    if (data.color) updateData.color = data.color;
    if (data.requiresApproval !== undefined) updateData.requiresApproval = data.requiresApproval;
    if (data.minBookingDuration) updateData.minBookingDuration = data.minBookingDuration;
    if (data.maxBookingDuration) updateData.maxBookingDuration = data.maxBookingDuration;
    if (data.advanceBookingDays) updateData.advanceBookingDays = data.advanceBookingDays;

    const updatedRoom = await db
      .update(rooms)
      .set(updateData)
      .where(and(eq(rooms.id, id), eq(rooms.tenantId, payload.tenantId as string)))
      .returning();

    if (updatedRoom.length === 0) {
      return errors.notFound('Room');
    }

    // Update amenities if provided
    if (data.amenities) {
      // Remove existing amenities
      await db.delete(roomAmenities).where(eq(roomAmenities.roomId, id));

      // Add new amenities
      if (data.amenities.length > 0) {
        const amenityLinks = data.amenities.map((amenityId) => ({
          roomId: id,
          amenityId,
        }));
        await db.insert(roomAmenities).values(amenityLinks);
      }
    }

    return successResponse(updatedRoom[0]);
  } catch (error) {
    console.error('Update room error:', error);
    return errors.internal('Failed to update room');
  }
}

// Delete room (Admin only)
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

    const deletedRoom = await db
      .delete(rooms)
      .where(and(eq(rooms.id, id), eq(rooms.tenantId, payload.tenantId as string)))
      .returning();

    if (deletedRoom.length === 0) {
      return errors.notFound('Room');
    }

    return successResponse({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    return errors.internal('Failed to delete room');
  }
}