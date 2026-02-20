import { pgTable, uuid, varchar, integer, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';
import { rooms } from './rooms';

export const approvalRules = pgTable('approval_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id')
    .references(() => rooms.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  conditions: jsonb('conditions').default({}).notNull(),
  userExceptions: jsonb('user_exceptions').default({}).notNull(),
  priority: integer('priority').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const approvalRulesRelations = relations(approvalRules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [approvalRules.tenantId],
    references: [tenants.id],
  }),
  room: one(rooms, {
    fields: [approvalRules.roomId],
    references: [rooms.id],
  }),
}));

export type ApprovalRule = typeof approvalRules.$inferSelect;
export type NewApprovalRule = typeof approvalRules.$inferInsert;