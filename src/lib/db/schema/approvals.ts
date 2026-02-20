import { pgTable, uuid, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { bookings } from './bookings';
import { users } from './users';

export const approvalStatusEnum = pgEnum('approval_status', [
  'pending',
  'approved',
  'rejected'
]);

export const approvals = pgTable('approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id')
    .notNull()
    .references(() => bookings.id, { onDelete: 'cascade' }),
  approverId: uuid('approver_id')
    .notNull()
    .references(() => users.id),
  status: approvalStatusEnum('status').default('pending').notNull(),
  comment: text('comment'),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const approvalsRelations = relations(approvals, ({ one }) => ({
  booking: one(bookings, {
    fields: [approvals.bookingId],
    references: [bookings.id],
  }),
  approver: one(users, {
    fields: [approvals.approverId],
    references: [users.id],
  }),
}));

export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;