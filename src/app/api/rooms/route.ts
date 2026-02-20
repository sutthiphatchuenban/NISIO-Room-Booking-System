import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { rooms, roomAmenities, amenities } from '@/lib/db/schema';
import { eq, and, gte, lte, inArray, sql, count } from 'drizzle-orm';
import { listRoomsSchema, createRoomSchema } from '@/lib/validations';
import { successResponse, errors, createMeta } from '@/lib/api/response';
import { verifyToken, getTokenFromRequest, hasRole } from '@/lib/api/auth';

// List all rooms
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
      limit: searchParams.get('limit') || '20',
      type: searchParams.getAll('type'),
      capacity: searchParams.get('capacity') || undefined,
      location: searchParams.get('location') || undefined,
      availableFrom: searchParams.get('availableFrom') || undefined,
      availableTo: searchParams.get('availableTo') || undefined,
      amenities: searchParams.getAll('amenities'),
    };

    const parsed = listRoomsSchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, limit, type, capacity, location } = parsed.data;

    const conditions = [eq(rooms.tenantId, payload.tenantId as string), eq(rooms.isActive, true)];

    if (type && type.length > 0) {
      conditions.push(inArray(rooms.type, type));
    }

    if (capacity) {
      conditions.push(gte(rooms.capacity, capacity));
    }

    if (location) {
      conditions.push(sql`${rooms.location} ILIKE ${`%${location}%`}`);
    }

    // Get total count
    const countResult = await db
      .select({ value: count() })
      .from(rooms)
      .where(and(...conditions));

    const total = Number(countResult[0].value);

    // Get rooms
    const roomList = await db
      .select({
        id: rooms.id,
        name: rooms.name,
        type: rooms.type,
        description: rooms.description,
        capacity: rooms.capacity,
        location: rooms.location,
        floor: rooms.floor,
        amenities: rooms.amenities,
        images: rooms.images,
        color: rooms.color,
        requiresApproval: rooms.requiresApproval,
        minBookingDuration: rooms.minBookingDuration,
        maxBookingDuration: rooms.maxBookingDuration,
        advanceBookingDays: rooms.advanceBookingDays,
        isActive: rooms.isActive,
      })
      .from(rooms)
      .where(and(...conditions))
      .limit(limit)
      .offset((page - 1) * limit);

    return successResponse(roomList, createMeta(page, limit, total));
  } catch (error) {
    console.error('List rooms error:', error);
    return errors.internal('Failed to list rooms');
  }
}

// Create new room (Admin only)
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
    const parsed = createRoomSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const data = parsed.data;

    const newRoom = await db
      .insert(rooms)
      .values({
        tenantId: payload.tenantId as string,
        name: data.name,
        type: data.type,
        description: data.description,
        capacity: data.capacity,
        location: data.location,
        floor: data.floor,
        color: data.color,
        requiresApproval: data.requiresApproval,
        minBookingDuration: data.minBookingDuration,
        maxBookingDuration: data.maxBookingDuration,
        advanceBookingDays: data.advanceBookingDays,
      })
      .returning();

    // Insert amenities if provided
    if (data.amenities && data.amenities.length > 0) {
      const amenityLinks = data.amenities.map((amenityId) => ({
        roomId: newRoom[0].id,
        amenityId,
      }));

      await db.insert(roomAmenities).values(amenityLinks);
    }

    return successResponse(newRoom[0]);
  } catch (error) {
    console.error('Create room error:', error);
    return errors.internal('Failed to create room');
  }
}