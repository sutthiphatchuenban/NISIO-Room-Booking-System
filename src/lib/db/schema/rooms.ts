import { pgTable, uuid, varchar, integer, jsonb, boolean, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';

export const roomTypeEnum = pgEnum('room_type', ['meeting_room', 'desk', 'phone_booth', 'event_space', 'quiet_room']);

export const rooms = pgTable('rooms', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: roomTypeEnum('type').default('meeting_room').notNull(),
  description: text('description'),
  capacity: integer('capacity').default(4).notNull(),
  location: varchar('location', { length: 255 }),
  floor: integer('floor').default(1),
  amenities: jsonb('amenities').default([]),
  images: jsonb('images').default([]),
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  isActive: boolean('is_active').default(true).notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  autoApprovalEnabled: boolean('auto_approval_enabled').default(false).notNull(),
  autoApprovalRules: jsonb('auto_approval_rules').default({}),
  minBookingDuration: integer('min_booking_duration').default(15),
  maxBookingDuration: integer('max_booking_duration').default(480),
  advanceBookingDays: integer('advance_booking_days').default(30),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roomsRelations = relations(rooms, ({ one }) => ({
  tenant: one(tenants, {
    fields: [rooms.tenantId],
    references: [tenants.id],
  }),
}));

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;