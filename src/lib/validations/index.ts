import { z } from 'zod';

// Common validation patterns
export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Auth validations
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(255),
  tenantSlug: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// User validations
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
});

export const listUsersSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(['user', 'manager', 'admin', 'super_admin']).optional(),
  department: z.string().optional(),
});

// Room validations
export const roomTypeSchema = z.enum(['meeting_room', 'desk', 'phone_booth', 'event_space', 'quiet_room']);

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: roomTypeSchema.default('meeting_room'),
  description: z.string().optional(),
  capacity: z.number().int().min(1).default(4),
  location: z.string().max(255).optional(),
  floor: z.number().int().default(1),
  amenities: z.array(z.string().uuid()).default([]),
  color: z.string().max(7).default('#3B82F6'),
  requiresApproval: z.boolean().default(false),
  minBookingDuration: z.number().int().min(15).default(15),
  maxBookingDuration: z.number().int().default(480),
  advanceBookingDays: z.number().int().default(30),
});

export const updateRoomSchema = createRoomSchema.partial();

export const listRoomsSchema = paginationSchema.extend({
  type: z.array(roomTypeSchema).optional(),
  capacity: z.coerce.number().optional(),
  location: z.string().optional(),
  availableFrom: z.coerce.date().optional(),
  availableTo: z.coerce.date().optional(),
  amenities: z.array(z.string().uuid()).optional(),
});

export const roomAvailabilitySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

// Booking validations
export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'rejected']);
export const recurrenceTypeSchema = z.enum(['none', 'daily', 'weekly', 'monthly']);

export const createBookingSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  recurrence: z.object({
    type: recurrenceTypeSchema,
    endDate: z.string().datetime().optional(),
  }).optional(),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateBookingSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

export const checkInSchema = z.object({
  qrCode: z.string().optional(),
});

export const listBookingsSchema = paginationSchema.extend({
  status: z.array(bookingStatusSchema).optional(),
  roomId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  view: z.enum(['list', 'calendar']).default('list'),
});

// Approval validations
export const approvalActionSchema = z.object({
  comment: z.string().optional(),
});

// Auto-approval rule validations
export const approvalConditionsSchema = z.object({
  maxDuration: z.number().int().optional(),
  maxAdvanceDays: z.number().int().optional(),
  allowedDays: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  allowedTimeStart: z.string().optional(),
  allowedTimeEnd: z.string().optional(),
});

export const userExceptionsSchema = z.object({
  allowedUserIds: z.array(z.string().uuid()).optional(),
  deniedUserIds: z.array(z.string().uuid()).optional(),
  allowedRoles: z.array(z.enum(['user', 'manager', 'admin', 'super_admin'])).optional(),
});

export const createApprovalRuleSchema = z.object({
  roomId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  conditions: approvalConditionsSchema.default({}),
  userExceptions: userExceptionsSchema.default({}),
  priority: z.number().int().default(0),
});

export const updateApprovalRuleSchema = createApprovalRuleSchema.partial().extend({
  enabled: z.boolean().optional(),
});

export const testApprovalRuleSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  duration: z.number().int(),
  startTime: z.string().datetime(),
});

// Amenity validations
export const createAmenitySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(50).default('Circle'),
  description: z.string().max(255).optional(),
});

export const updateAmenitySchema = createAmenitySchema.partial();

// Dashboard validations
export const calendarViewSchema = z.object({
  view: z.enum(['day', 'week', 'month']).default('week'),
  date: z.string().datetime().optional(),
  roomId: z.string().uuid().optional(),
});

export const analyticsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Admin validations
export const approvalHistorySchema = paginationSchema.extend({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  status: z.array(z.enum(['approved', 'rejected', 'auto_approved'])).optional(),
  approverId: z.string().uuid().optional(),
});

// User management validations (Admin)
export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'manager', 'admin', 'super_admin']),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CreateApprovalRuleInput = z.infer<typeof createApprovalRuleSchema>;
export type UpdateApprovalRuleInput = z.infer<typeof updateApprovalRuleSchema>;
export type TestApprovalRuleInput = z.infer<typeof testApprovalRuleSchema>;
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>;
export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;