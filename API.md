# NISIO Room Booking System - API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
All API endpoints (except auth routes) require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## API Endpoints

### Authentication

#### POST /auth/login
Login with username and password.
```json
{
  "username": "johndoe",
  "password": "securePassword123",
  "rememberMe": true
}
```

#### POST /auth/register
Register new user account.
```json
{
  "username": "newuser",
  "password": "securePassword123",
  "name": "New User",
  "tenantSlug": "company-slug"
}
```

#### POST /auth/refresh
Refresh access token.
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### POST /auth/logout
Logout user.

### Users

#### GET /users/me
Get current user profile.

#### PATCH /users/me
Update current user profile.
```json
{
  "name": "Updated Name",
  "phone": "+66 8987 6543",
  "department": "Product"
}
```

#### GET /users
List all users (Admin only).
Query params: `page`, `limit`, `search`, `role`, `department`

### Rooms

#### GET /rooms
List all rooms.
Query params: `page`, `limit`, `type`, `capacity`, `location`, `availableFrom`, `availableTo`, `amenities`

#### POST /rooms
Create new room (Admin only).
```json
{
  "name": "Conference Room A",
  "type": "meeting_room",
  "description": "Large meeting room",
  "capacity": 12,
  "location": "Building A, Floor 3",
  "floor": 3,
  "amenities": ["uuid1", "uuid2"],
  "color": "#3B82F6",
  "requiresApproval": false
}
```

#### GET /rooms/:id
Get room details.

#### PATCH /rooms/:id
Update room (Admin only).

#### DELETE /rooms/:id
Delete room (Admin only).

#### GET /rooms/:id/availability
Get room availability for date range.
Query params: `from`, `to`

### Bookings

#### GET /bookings
List bookings.
Query params: `page`, `limit`, `status`, `roomId`, `userId`, `from`, `to`, `view`

#### POST /bookings
Create new booking.
```json
{
  "roomId": "uuid",
  "title": "Team Meeting",
  "description": "Weekly sync",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T10:00:00Z",
  "recurrence": {
    "type": "weekly",
    "endDate": "2024-06-01"
  }
}
```

#### GET /bookings/:id
Get booking details.

#### PATCH /bookings/:id
Update booking.

#### DELETE /bookings/:id
Cancel booking.
```json
{
  "reason": "Meeting cancelled"
}
```

#### POST /bookings/:id/check-in
Check in to booking.

#### GET /bookings/my
Get current user's bookings.

#### GET /bookings/upcoming
Get upcoming bookings for current user.

### Approvals

#### GET /approvals/pending
Get pending approvals (Manager/Admin only).

#### POST /approvals/:bookingId/approve
Approve a booking.
```json
{
  "comment": "Approved for team meeting"
}
```

#### POST /approvals/:bookingId/reject
Reject a booking.
```json
{
  "comment": "Room unavailable"
}
```

### Auto Approval Rules

#### GET /settings/auto-approval
Get auto approval rules (Admin only).

#### POST /settings/auto-approval/rules
Create auto approval rule (Admin only).
```json
{
  "roomId": "uuid",
  "name": "Quick Bookings",
  "conditions": {
    "maxDuration": 120,
    "maxAdvanceDays": 7,
    "allowedDays": ["mon", "tue", "wed", "thu", "fri"],
    "allowedTimeStart": "09:00",
    "allowedTimeEnd": "17:00"
  },
  "userExceptions": {
    "allowedRoles": ["admin", "manager"]
  },
  "priority": 1
}
```

#### PATCH /settings/auto-approval/rules/:id
Update auto approval rule (Admin only).

#### DELETE /settings/auto-approval/rules/:id
Delete auto approval rule (Admin only).

#### POST /settings/auto-approval/test
Test auto approval rules (Admin only).
```json
{
  "roomId": "uuid",
  "userId": "uuid",
  "duration": 60,
  "startTime": "2024-01-15T09:00:00Z"
}
```

### Amenities

#### GET /amenities
List all amenities.

#### POST /amenities
Create amenity (Admin only).
```json
{
  "name": "Projector",
  "icon": "Projector",
  "description": "HD projector"
}
```

#### PATCH /amenities/:id
Update amenity (Admin only).

#### DELETE /amenities/:id
Delete amenity (Admin only).

### Dashboard

#### GET /dashboard/stats
Get dashboard statistics.

#### GET /dashboard/calendar
Get calendar data.
Query params: `view`, `date`, `roomId`

#### GET /dashboard/analytics
Get analytics data (Admin only).
Query params: `period`, `from`, `to`

### Admin

#### GET /admin/approvals/stats
Get approval statistics (Admin only).

#### GET /admin/approvals/history
Get approval history (Admin only).
Query params: `page`, `limit`, `from`, `to`, `status`, `approverId`

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /auth/* | 5 | 1 minute |
| /api/* | 100 | 1 minute |
| /bookings (POST) | 10 | 1 minute |

## Role-Based Access Control

| Endpoint | User | Manager | Admin | Super Admin |
|----------|------|---------|-------|-------------|
| Book room | ✅ | ✅ | ✅ | ✅ |
| Cancel own booking | ✅ | ✅ | ✅ | ✅ |
| View all bookings | ❌ | ✅ | ✅ | ✅ |
| Approve bookings | ❌ | ✅ | ✅ | ✅ |
| Manage rooms | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Manage settings | ❌ | ❌ | ✅ | ✅ |
| Multi-tenant admin | ❌ | ❌ | ❌ | ✅ |