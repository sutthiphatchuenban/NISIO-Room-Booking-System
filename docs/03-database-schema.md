# Database Schema Design

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   tenants   │       │    users    │       │   bookings  │       │    rooms    │
├─────────────┤       ├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ tenantId(FK)│       │ id (PK)     │◄──────┤ id (PK)     │
│ name        │       │ id (PK)     │◄──────┤ userId (FK) │       │ tenantId(FK)│
│ slug        │       │ username    │       │ roomId (FK) │──────►│ name        │
│ settings    │       │ name        │       │ title       │       │ type        │
│ createdAt   │       │ role        │       │ description │       │ capacity    │
│ updatedAt   │       │ department  │       │ startTime   │       │ amenities   │
└─────────────┘       │ createdAt   │       │ endTime     │       │ location    │
       │              │ updatedAt   │       │ status      │       │ isActive    │
       │                     │              │ createdAt   │       │ createdAt   │
       │                     │              │ updatedAt   │       │ updatedAt   │
       │                     │              └─────────────┘       └─────────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│room_settings│       │user_sessions│       │  approvals  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ roomId (FK) │◄──────┤ userId (FK) │       │ bookingId(FK)│◄────┘
│ advanceBook │       │ token       │       │ approverId  │
│ maxDuration │       │ expiresAt   │       │ status      │
│ minNotice   │       │ createdAt   │       │ comment     │
└─────────────┘       └─────────────┘       │ createdAt   │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  amenities  │       │room_amenities│      │   audits    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ amenityId   │       │ id (PK)     │
│ tenantId(FK)│       │ roomId (FK) │──────►│ entityType  │
│ name        │       └─────────────┘       │ entityId    │
│ icon        │                             │ action      │
│ createdAt   │                             │ userId      │
└─────────────┘                             │ oldValue    │
                                            │ newValue    │
                                            │ createdAt   │
                                            └─────────────┘
```

## 🗄️ Drizzle ORM Schema

### Core Tables

#### Tenants (Multi-tenancy)
```typescript
// src/lib/db/schema/tenants.ts
import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  logo: varchar('logo', { length: 500 }),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
```

#### Users
```typescript
// src/lib/db/schema/users.ts
import { pgTable, uuid, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const userRoleEnum = pgEnum('user_role', ['user', 'manager', 'admin', 'super_admin']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  department: varchar('department', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  avatar: varchar('avatar', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  bookings: many(bookings),
  approvals: many(approvals),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

#### Rooms
```typescript
// src/lib/db/schema/rooms.ts
import { pgTable, uuid, varchar, integer, jsonb, boolean, timestamp, text } from 'drizzle-orm/pg-core';

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
  autoApprovalRules: jsonb('auto_approval_rules').default([]),
  minBookingDuration: integer('min_booking_duration').default(15), // minutes
  maxBookingDuration: integer('max_booking_duration').default(480), // minutes (8 hours)
  advanceBookingDays: integer('advance_booking_days').default(30),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const roomRelations = relations(rooms, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [rooms.tenantId],
    references: [tenants.id],
  }),
  bookings: many(bookings),
  roomAmenities: many(roomAmenities),
}));

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
```

#### Bookings
```typescript
// src/lib/db/schema/bookings.ts
import { pgTable, uuid, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'rejected'
]);

export const recurrenceTypeEnum = pgEnum('recurrence_type', [
  'none',
  'daily',
  'weekly',
  'monthly'
]);

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  recurrenceType: recurrenceTypeEnum('recurrence_type').default('none'),
  recurrenceEndDate: timestamp('recurrence_end_date'),
  parentBookingId: uuid('parent_booking_id'),
  checkedInAt: timestamp('checked_in_at'),
  checkedInBy: uuid('checked_in_by'),
  cancellationReason: text('cancellation_reason'),
  cancelledAt: timestamp('cancelled_at'),
  cancelledBy: uuid('cancelled_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [bookings.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
  approvals: many(approvals),
}));

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
```

#### Approvals
```typescript
// src/lib/db/schema/approvals.ts
import { pgTable, uuid, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';

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

export const approvalRelations = relations(approvals, ({ one }) => ({
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
```

#### Amenities
```typescript
// src/lib/db/schema/amenities.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const amenities = pgTable('amenities', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).default('Circle'),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const roomAmenities = pgTable('room_amenities', {
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  amenityId: uuid('amenity_id')
    .notNull()
    .references(() => amenities.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.amenityId] }),
}));

export type Amenity = typeof amenities.$inferSelect;
export type NewAmenity = typeof amenities.$inferInsert;
```

#### Auto Approval Rules
```typescript
// src/lib/db/schema/approval-rules.ts
import { pgTable, uuid, varchar, integer, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const approvalRules = pgTable('approval_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  roomId: uuid('room_id')
    .references(() => rooms.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  
  // เงื่อนไขการอนุมัติอัตโนมัติ
  conditions: jsonb('conditions').default({}).notNull(),
  // {
  //   maxDuration: 120,        // นาที
  //   maxAdvanceDays: 7,       // วัน
  //   allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  //   allowedTimeStart: '09:00',
  //   allowedTimeEnd: '17:00'
  // }
  
  // ข้อยกเว้นผู้ใช้
  userExceptions: jsonb('user_exceptions').default({}).notNull(),
  // {
  //   allowedUserIds: [],      // อนุมัติอัตโนมัติเสมอ
  //   deniedUserIds: [],       // ต้องรออนุมัติเสมอ
  //   allowedRoles: ['admin', 'manager']
  // }
  
  priority: integer('priority').default(0).notNull(), // สูง = ตรวจสอบก่อน
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const approvalRuleRelations = relations(approvalRules, ({ one }) => ({
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
```

#### Audit Logs
```typescript
// src/lib/db/schema/audits.ts
import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'booking', 'room', 'user'
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'create', 'update', 'delete', 'approve'
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
```

### Database Indexes

```typescript
// Performance indexes
export const bookingIndexes = {
  // For calendar queries
  bookingTimeIdx: index('booking_time_idx').on(bookings.startTime, bookings.endTime),
  // For user's bookings
  userBookingIdx: index('user_booking_idx').on(bookings.userId, bookings.startTime),
  // For room availability
  roomTimeIdx: index('room_time_idx').on(bookings.roomId, bookings.startTime, bookings.status),
  // For tenant isolation
  tenantBookingIdx: index('tenant_booking_idx').on(bookings.tenantId),
};

export const userIndexes = {
  // For login
  userUsernameIdx: index('user_username_idx').on(users.username),
  // For tenant queries
  userTenantIdx: index('user_tenant_idx').on(users.tenantId),
};
```

## 🔌 Database Connection

```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Helper types
export type DB = typeof db;
```

## 🔄 Migrations

### Drizzle Config
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema/*.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Migration Commands
```bash
# Generate migrations
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate

# Studio (GUI)
npx drizzle-kit studio
```

## 📊 Database Views

### Booking Calendar View
```sql
-- For efficient calendar queries
CREATE VIEW booking_calendar AS
SELECT 
  b.id,
  b.title,
  b.start_time,
  b.end_time,
  b.status,
  u.name as user_name,
  u.username as user_username,
  r.name as room_name,
  r.type as room_type,
  r.color as room_color,
  b.tenant_id
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN rooms r ON b.room_id = r.id
WHERE b.status IN ('confirmed', 'pending');
```

## 🔒 Data Integrity

### Constraints
- **Foreign Keys** - Cascade delete on tenant removal
- **Check Constraints** - endTime > startTime
- **Unique Constraints** - Username per tenant, Slug uniqueness
- **Not Null** - Required fields enforcement

### Soft Deletes
ใช้ `isActive` flag แทนการลบข้อมูลจริง เพื่อเก็บประวัติและรักษาความสัมพันธ์ของข้อมูล