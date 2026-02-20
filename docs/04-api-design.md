# API Design

## 📡 API Architecture

### Base URL
```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

### Authentication
ทุก API endpoint (ยกเว้น public) ต้องมี JWT Token ใน Header:
```http
Authorization: Bearer <jwt_token>
```

### Response Format
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## 🔐 Authentication APIs

### POST /auth/login
Login with username and password.

**Request:**
```typescript
{
  "username": "johndoe",
  "password": "securePassword123",
  "rememberMe": true
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "name": "John Doe",
      "role": "user",
      "tenantId": "uuid"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresAt": "2024-12-31T23:59:59Z"
    }
  }
}
```

### POST /auth/register
Register new user account.

**Request:**
```typescript
{
  "username": "newuser",
  "password": "securePassword123",
  "name": "New User",
  "tenantSlug": "company-slug" // Optional for multi-tenant
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```typescript
{
  "refreshToken": "jwt_refresh_token"
}
```

### POST /auth/logout
Logout and invalidate token.

### POST /auth/forgot-password
Request password reset.

### POST /auth/reset-password
Reset password with token.

## 👤 User APIs

### GET /users/me
Get current user profile.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "johndoe",
    "name": "John Doe",
    "role": "user",
    "department": "Engineering",
    "phone": "+66 8123 4567",
    "avatar": "https://...",
    "tenant": {
      "id": "uuid",
      "name": "Company Name"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /users/me
Update current user profile.

**Request:**
```typescript
{
  "name": "Updated Name",
  "phone": "+66 8987 6543",
  "department": "Product"
}
```

### POST /users/me/avatar
Upload avatar image.

### GET /users
List all users (Admin only).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by name/username |
| role | string | Filter by role |
| department | string | Filter by department |

## 🚪 Room APIs

### GET /rooms
List all rooms.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| type | string[] | Filter by type (meeting_room, desk, etc.) |
| capacity | number | Min capacity required |
| location | string | Filter by location |
| availableFrom | datetime | Check availability from |
| availableTo | datetime | Check availability to |
| amenities | string[] | Required amenities |

**Response:**
```typescript
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Conference Room A",
      "type": "meeting_room",
      "description": "Large meeting room with projector",
      "capacity": 12,
      "location": "Building A, Floor 3",
      "floor": 3,
      "amenities": [
        { "id": "uuid", "name": "Projector", "icon": "Projector" },
        { "id": "uuid", "name": "Whiteboard", "icon": "Presentation" }
      ],
      "images": ["url1", "url2"],
      "color": "#3B82F6",
      "isAvailable": true,
      "nextAvailable": null,
      "requiresApproval": false,
      "settings": {
        "minBookingDuration": 30,
        "maxBookingDuration": 480,
        "advanceBookingDays": 30
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

### GET /rooms/:id
Get room details.

### POST /rooms
Create new room (Admin only).

**Request:**
```typescript
{
  "name": "New Meeting Room",
  "type": "meeting_room",
  "description": "Description here",
  "capacity": 8,
  "location": "Building B, Floor 2",
  "floor": 2,
  "amenities": ["uuid1", "uuid2"],
  "color": "#10B981",
  "requiresApproval": true,
  "minBookingDuration": 15,
  "maxBookingDuration": 240,
  "advanceBookingDays": 14
}
```

### PATCH /rooms/:id
Update room (Admin only).

### DELETE /rooms/:id
Delete room (Admin only).

### GET /rooms/:id/availability
Get room availability for date range.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| from | date | Yes | Start date |
| to | date | Yes | End date |

**Response:**
```typescript
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "dateRange": { "from": "2024-01-01", "to": "2024-01-07" },
    "slots": [
      {
        "date": "2024-01-01",
        "availableSlots": [
          { "start": "09:00", "end": "10:00", "available": true },
          { "start": "10:00", "end": "11:00", "available": false, "bookingId": "uuid" },
          { "start": "11:00", "end": "12:00", "available": true }
        ]
      }
    ]
  }
}
```

## 📅 Booking APIs

### GET /bookings
List bookings.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string[] | Filter by status |
| roomId | string | Filter by room |
| userId | string | Filter by user (Admin only) |
| from | datetime | Start date range |
| to | datetime | End date range |
| view | string | 'list' or 'calendar' |

### GET /bookings/:id
Get booking details.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Weekly Team Meeting",
    "description": "Sprint planning",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T10:00:00Z",
    "status": "confirmed",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe"
    },
    "room": {
      "id": "uuid",
      "name": "Conference Room A",
      "type": "meeting_room",
      "location": "Building A, Floor 3"
    },
    "recurrence": {
      "type": "weekly",
      "endDate": "2024-06-01"
    },
    "approval": {
      "status": "approved",
      "approver": { "name": "Manager" },
      "respondedAt": "2024-01-10T08:00:00Z",
      "comment": "Approved"
    },
    "checkIn": {
      "checkedInAt": "2024-01-15T09:05:00Z",
      "qrCode": "base64..."
    },
    "createdAt": "2024-01-08T10:00:00Z"
  }
}
```

### POST /bookings
Create new booking.

**Request:**
```typescript
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

**Validation Rules:**
- startTime < endTime
- Duration >= room.minBookingDuration
- Duration <= room.maxBookingDuration
- startTime must be in the future
- startTime <= now + room.advanceBookingDays
- Room must be available

### PATCH /bookings/:id
Update booking (Owner or Admin only).

### DELETE /bookings/:id
Cancel booking (Owner or Admin only).

**Request:**
```typescript
{
  "reason": "Meeting cancelled"
}
```

### POST /bookings/:id/check-in
Check in to booking.

**Request:**
```typescript
{
  "qrCode": "optional_qr_code_data"
}
```

### GET /bookings/my
Get current user's bookings.

### GET /bookings/upcoming
Get upcoming bookings for current user.

## ✅ Approval APIs

### GET /approvals/pending
Get pending approvals (Manager/Admin only).

### POST /approvals/:bookingId/approve
Approve a booking.

**Request:**
```typescript
{
  "comment": "Approved for team meeting"
}
```

### POST /approvals/:bookingId/reject
Reject a booking.

**Request:**
```typescript
{
  "comment": "Room unavailable for this time"
}
```

## 🤖 Auto Approval APIs

### GET /settings/auto-approval
Get auto approval rules (Admin only).

**Response:**
```typescript
{
  "success": true,
  "data": {
    "enabled": true,
    "rules": [
      {
        "id": "uuid",
        "roomId": "uuid",
        "name": "Quick Bookings (< 2hrs)",
        "enabled": true,
        "conditions": {
          "maxDuration": 120,
          "maxAdvanceDays": 7,
          "allowedDays": ["mon", "tue", "wed", "thu", "fri"],
          "allowedTimeStart": "09:00",
          "allowedTimeEnd": "17:00"
        },
        "userExceptions": {
          "allowedUserIds": ["uuid1", "uuid2"],
          "deniedUserIds": [],
          "allowedRoles": ["admin", "manager"]
        },
        "priority": 1,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### POST /settings/auto-approval/rules
Create auto approval rule (Admin only).

**Request:**
```typescript
{
  "roomId": "uuid",              // null = ใช้กับทุกห้อง
  "name": "Weekend Bookings",
  "conditions": {
    "maxDuration": 480,
    "maxAdvanceDays": 14,
    "allowedDays": ["sat", "sun"],
    "allowedTimeStart": "09:00",
    "allowedTimeEnd": "18:00"
  },
  "userExceptions": {
    "allowedRoles": ["admin"]
  },
  "priority": 2
}
```

### PATCH /settings/auto-approval/rules/:id
Update auto approval rule (Admin only).

### DELETE /settings/auto-approval/rules/:id
Delete auto approval rule (Admin only).

### POST /settings/auto-approval/test
Test auto approval rules against booking data (Admin only).

**Request:**
```typescript
{
  "roomId": "uuid",
  "userId": "uuid",
  "duration": 60,                // นาที
  "startTime": "2024-01-15T09:00:00Z"
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "wouldAutoApprove": true,
    "matchedRule": {
      "id": "uuid",
      "name": "Quick Bookings (< 2hrs)"
    },
    "reason": "Duration 60 mins <= 120, Business hours, Weekday"
  }
}
```

## 📊 Admin Approval Dashboard APIs

### GET /admin/approvals/stats
Get approval statistics (Admin only).

**Response:**
```typescript
{
  "success": true,
  "data": {
    "pendingCount": 15,
    "todayApproved": 23,
    "todayRejected": 2,
    "autoApprovalRate": 68.5,     // เปอร์เซ็นต์การอนุมัติอัตโนมัติ
    "averageApprovalTime": 45     // นาที (สำหรับที่ไม่ auto)
  }
}
```

### GET /admin/approvals/history
Get approval history with filters (Admin only).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| from | date | Start date |
| to | date | End date |
| status | string[] | ['approved', 'rejected', 'auto_approved'] |
| approverId | string | Filter by approver |

## 🏷️ Amenity APIs

### GET /amenities
List all amenities.

### POST /amenities
Create amenity (Admin only).

**Request:**
```typescript
{
  "name": "Video Conference",
  "icon": "Video",
  "description": "HD video conferencing system"
}
```

### PATCH /amenities/:id
Update amenity (Admin only).

### DELETE /amenities/:id
Delete amenity (Admin only).

## 📊 Dashboard APIs

### GET /dashboard/stats
Get dashboard statistics.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "today": {
      "totalBookings": 15,
      "activeNow": 3,
      "upcoming": 5
    },
    "thisWeek": {
      "totalBookings": 87,
      "utilizationRate": 68.5,
      "topRooms": [
        { "roomId": "uuid", "name": "Room A", "bookings": 12 }
      ]
    },
    "myBookings": {
      "total": 8,
      "today": 1,
      "thisWeek": 3,
      "pendingApproval": 1
    }
  }
}
```

### GET /dashboard/calendar
Get calendar data.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| view | string | 'day', 'week', 'month' |
| date | date | Reference date |
| roomId | string | Filter by room |

### GET /dashboard/analytics
Get analytics data (Admin only).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| period | string | 'day', 'week', 'month', 'year' |
| from | date | Start date |
| to | date | End date |

**Response:**
```typescript
{
  "success": true,
  "data": {
    "utilization": {
      "overall": 72.5,
      "byRoomType": {
        "meeting_room": 85.0,
        "desk": 60.0
      },
      "trend": [
        { "date": "2024-01-01", "rate": 70 },
        { "date": "2024-01-02", "rate": 75 }
      ]
    },
    "bookings": {
      "total": 156,
      "cancelled": 12,
      "averageDuration": 67.5 // minutes
    },
    "peakHours": [
      { "hour": 9, "bookings": 45 },
      { "hour": 14, "bookings": 52 }
    ]
  }
}
```

## ⚙️ Settings APIs

### GET /settings/tenant
Get tenant settings (Admin only).

### PATCH /settings/tenant
Update tenant settings (Admin only).

**Request:**
```typescript
{
  "name": "New Company Name",
  "settings": {
    "defaultBookingDuration": 60,
    "requireApproval": false,
    "allowRecurring": true,
    "workingHours": {
      "start": "09:00",
      "end": "18:00"
    }
  }
}
```

## 🔒 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /auth/* | 5 | 1 minute |
| /api/* | 100 | 1 minute |
| /bookings (POST) | 10 | 1 minute |

## 📝 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| CONFLICT | 409 | Resource conflict (e.g., room unavailable) |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |