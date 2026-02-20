# Feature Specifications

## 🎯 Feature Overview

ระบบ NISIO Room Booking System ประกอบด้วยฟีเจอร์หลัก ๆ ดังนี้:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FEATURE MAP                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Booking    │  │    Room      │  │    User      │  │   Calendar   │    │
│  │   Engine     │  │  Management  │  │  Management  │  │    Views     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                 │                 │                 │            │
│         └─────────────────┴─────────────────┴─────────────────┘            │
│                                    │                                        │
│                              ┌──────────┐                                   │
│                              │  Core    │                                   │
│                              │ Platform │                                   │
│                              └──────────┘                                   │
│                                    │                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                        │
│  │  Analytics   │  │   Search &   │  │   Settings   │                        │
│  │   & Reports  │  │    Filter    │  │   & Config   │                        │
│  └──────────────┘  └──────────────┘  └──────────────┘                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Booking Engine

### Core Booking Flow
```
User selects room
       │
       ▼
Select date & time
       │
       ▼
System validates availability
       │
       ├─► Available ──► Create booking
       │
       └─► Unavailable ──► Suggest alternatives
       │
       ▼
Requires approval?
       │
       ├─► Yes ──► Send to approver
       │
       └─► No ──► Confirm immediately
```

### Features

#### 1.1 Instant Booking
- **Description**: จองห้อง/โต๊ะทันทีโดยไม่ต้องรออนุมัติ
- **User Story**: ในฐานะผู้ใช้ ฉันต้องการจองห้องได้ทันที เพื่อไม่ต้องเสียเวลารออนุมัติ
- **Acceptance Criteria**:
  - [ ] แสดงห้องที่ว่างแบบเรียลไทม์
  - [ ] เลือกเวลาได้ด้วย drag & drop บน calendar
  - [ ] แสดงข้อความยืนยันเมื่อจองสำเร็จ

#### 1.2 Recurring Bookings
- **Description**: จองซ้ำอัตโนมัติตามรอบที่กำหนด
- **Patterns**:
  - Daily - ทุกวัน
  - Weekly - ทุกสัปดาห์ (เลือกวันได้)
  - Monthly - ทุกเดือน (วันที่เดิม หรือ วันที่ N ของสัปดาห์)
- **End Conditions**:
  - จำนวนครั้ง (e.g., 10 ครั้ง)
  - วันที่สิ้นสุด (e.g., 2024-12-31)

#### 1.3 Booking Modification
- **Edit Booking**:
  - เปลี่ยนเวลา (ย้าย booking)
  - เปลี่ยนห้อง (หากว่าง)
  - เพิ่ม/ลบ attendees
  - แก้ไข title/description
- **Restrictions**:
  - ไม่สามารถแก้ไขการจองที่ผ่านมาแล้ว
  - แก้ไข recurring series ทั้งชุดหรือเฉพาะ occurrence

#### 1.4 Booking Cancellation
- **Cancellation Rules**:
  - ยกเลิกได้ตลอดก่อนเวลาเริ่ม
  - บันทึกเหตุผลการยกเลิก (optional)
- **Auto-cancellation**:
  - No-show detection (ไม่ check-in ภายใน X นาที)

#### 1.5 Check-in System
- **QR Code Check-in**:
  - สร้าง QR Code สำหรับแต่ละ booking
  - Scan ผ่าน mobile หรือ tablet ที่ห้อง
  - อัตโนมัติหากใช้งานจริง
- **Manual Check-in**:
  - กดปุ่ม "Check-in" ในแอป
  - มีเวลาให้ check-in (e.g., 15 นาทีก่อนและหลังเวลาเริ่ม)

---

## 2️⃣ Room Management

### Room Types
| Type | Description | Use Case |
|------|-------------|----------|
| **Meeting Room** | ห้องประชุมมาตรฐาน | ประชุมทีม, present |
| **Phone Booth** | ห้องเล็กสำหรับโทรศัพท์ | คุยโทรศัพท์ส่วนตัว |
| **Quiet Room** | ห้องเงียบ | Focus work, นั่งสมาธิ |
| **Event Space** | พื้นที่จัดกิจกรรม | Workshop, seminar |
| **Desk** | โต๊ะทำงาน | Hot desking |

### Features

#### 2.1 Room Configuration
```typescript
interface RoomSettings {
  // Booking Rules
  minBookingDuration: number;      // นาที (default: 15)
  maxBookingDuration: number;      // นาที (default: 480)
  advanceBookingDays: number;      // วันล่วงหน้า (default: 30)
  
  // Approval
  requiresApproval: boolean;       // ต้องรออนุมัติ
  autoApprovalEnabled: boolean;    // เปิดระบบอนุมัติอัตโนมัติ
  autoApprovalRules: AutoApprovalRule[]; // กฎการอนุมัติอัตโนมัติ
  
  // Buffer Time
  bufferBefore: number;            // เว้นก่อน (นาที)
  bufferAfter: number;             // เว้นหลัง (นาที)
  
  // Availability
  workingHours: {
    start: string;                 // "09:00"
    end: string;                   // "18:00"
  };
  excludedDates: Date[];           // วันหยุดเฉพาะ
}

interface AutoApprovalRule {
  id: string;
  name: string;                    // ชื่อกฎ เช่น "Quick Bookings"
  enabled: boolean;
  
  // เงื่อนไขการอนุมัติอัตโนมัติ
  conditions: {
    maxDuration?: number;          // จองไม่เกิน X นาที
    maxAdvanceDays?: number;       // จองล่วงหน้าไม่เกิน X วัน
    allowedDays?: string[];        // ['mon', 'tue', 'wed', 'thu', 'fri']
    allowedTimeStart?: string;     // "09:00"
    allowedTimeEnd?: string;       // "17:00"
    excludedRoomTypes?: string[];  // ยกเว้นห้องประเภทนี้
  };
  
  // ผู้ใช้ที่ได้รับยกเว้น
  userExceptions: {
    allowedUserIds?: string[];     // User ID ที่อนุมัติอัตโนมัติเสมอ
    deniedUserIds?: string[];      // User ID ที่ต้องรออนุมัติเสมอ
    allowedRoles?: string[];       // ['admin', 'manager'] - role ที่อนุมัติอัตโนมัติ
  };
  
  priority: number;                // ลำดับความสำคัญ (สูง = ตรวจสอบก่อน)
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.2 Auto Approval System
- **Smart Auto Approval** - ระบบอนุมัติอัตโนมัติอัจฉริยะ
  - กำหนดกฎหลายกฎพร้อมเงื่อนไขที่ยืดหยุ่น
  - รองรับ exception สำหรับ user/role พิเศษ
  - ตรวจสอบตามลำดับ priority
  
- **Approval Rules Engine**:
  | เงื่อนไข | ตัวอย่าง |
  |----------|----------|
  | Duration Limit | จองไม่เกิน 2 ชั่วโมง |
  | Advance Booking | จองล่วงหน้าไม่เกิน 7 วัน |
  | Time Window | เฉพาะ 09:00-17:00 |
  | Day of Week | เฉพาะวันจันทร์-ศุกร์ |
  | User Role | Admin/Manager อนุมัติอัตโนมัติ |
  
- **Override Capabilities**:
  - Admin สามารถตั้งค่าให้บาง user อนุมัติอัตโนมัติเสมอ
  - บาง user ที่มีประวัติไม่ดี สามารถบังคับรออนุมัติเสมอ

#### 2.2 Amenity Management
- **Standard Amenities**:
  - Projector
  - Whiteboard
  - Video Conference
  - TV/Monitor
  - Sound System
  - Air Conditioning
  - Natural Light
  - Coffee Machine
  
- **Custom Amenities**:
  - Admin สร้าง amenity เองได้
  - กำหนด icon ได้
  - Filter หาห้องตาม amenity

#### 2.3 Room Images
- อัปโหลดรูปภาพห้องได้หลายรูป
- รองรับ drag & drop
- Auto-resize สำหรับ performance

---

## 3️⃣ Calendar Views

### View Types

#### 3.1 Day View
```
┌─────────────────────────────────────────────────────────────┐
│  Time    │  Room A   │  Room B   │  Room C   │  Room D      │
├──────────┼───────────┼───────────┼───────────┼──────────────┤
│  09:00   │  ████████ │           │  ████████ │              │
│  09:30   │  █Meeting │           │  █Standup │              │
│  10:00   │  ████████ │  ████████ │  ████████ │              │
│  10:30   │           │  █Review  │           │              │
│  11:00   │           │  ████████ │           │  ████████    │
│  ...     │           │           │           │  █Planning   │
└─────────────────────────────────────────────────────────────┘
```
- แสดงทุกห้องในแนวนอน
- Timeline แนวตั้ง
- Drag to create/resize booking

#### 3.2 Week View
```
┌─────────────────────────────────────────────────────────────┐
│  Room: Conference A                                          │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────┤
│  Mon     │  Tue     │  Wed     │  Thu     │  Fri     │ ...  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────┤
│  ████    │          │  ████    │  ████    │          │      │
│  Sprint  │          │  Retro   │  ████    │          │      │
│          │          │          │  Demo    │          │      │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────┘
```
- แสดง 1 ห้องตลอดทั้งสัปดาห์
- หรือแสดงหลายห้องในแนวตั้ง

#### 3.3 Month View
- Grid calendar แบบปกติ
- แสดง booking เป็น dots
- Click เพื่อดูรายละเอียดวันนั้น

#### 3.4 List View
- รายการแบบตาราง
- Sort/Filter ได้
- Quick actions

#### 3.5 Timeline View (for Admin)
- มุมมองผู้ดูแลระบบ
- แสดงทุกห้องพร้อมกัน
- Overbooking detection

---

## 4️⃣ User Management

### Roles & Permissions

| Permission | User | Manager | Admin | Super Admin |
|------------|:----:|:-------:|:-----:|:-----------:|
| View rooms | ✅ | ✅ | ✅ | ✅ |
| Book room | ✅ | ✅ | ✅ | ✅ |
| Cancel own booking | ✅ | ✅ | ✅ | ✅ |
| View all bookings | ❌ | ✅ | ✅ | ✅ |
| Approve bookings | ❌ | ✅ | ✅ | ✅ |
| Manage rooms | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ✅ |
| Manage settings | ❌ | ❌ | ✅ | ✅ |
| Multi-tenant admin | ❌ | ❌ | ❌ | ✅ |

### User Profile Features
- **Personal Information**: ชื่อ, ชื่อผู้ใช้, แผนก, เบอร์โทร
- **Avatar**: อัปโหลดรูปโปรไฟล์
- **Preferences**:
  - Default view (Day/Week/Month)
  - Calendar sync settings
- **My Bookings**: ดูประวัติการจองทั้งหมด
- **Statistics**: จำนวนชั่วโมงใช้งาน, ห้องที่ใช้บ่อย

---

## 5️⃣ Analytics & Reports

### Dashboard Metrics

#### 6.1 Real-time Stats
```
┌─────────────────────────────────────────────────────────┐
│  📊 Dashboard - Today                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │   Active    │  │   Today's   │  │  Available  │    │
│   │   Now: 3    │  │  Bookings:  │  │   Rooms: 8  │    │
│   │             │  │     15      │  │             │    │
│   └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### 6.2 Usage Analytics
- **Utilization Rate** - เปอร์เซ็นต์การใช้งาน
- **Peak Hours** - ช่วงเวลายุ่งที่สุด
- **Popular Rooms** - ห้องที่จองบ่อย
- **Booking Trends** - แนวโน้มการจอง

#### 6.3 Reports
- **Daily Report** - สรุปรายวัน
- **Weekly Report** - สรุปรายสัปดาห์
- **Monthly Report** - สรุปรายเดือน
- **Custom Report** - เลือกช่วงเวลาเอง

---

## 7️⃣ Search & Filter

### Search Capabilities
- **Text Search**: ชื่อห้อง, รายละเอียด
- **Filter by**:
  - Room type
  - Capacity (min-max)
  - Location/Floor
  - Amenities
  - Availability time range
- **Sort by**:
  - Name
  - Capacity
  - Popularity
  - Distance (future)

### Smart Suggestions
- **Recommended Rooms** - แนะนำห้องตามประวัติ
- **Alternative Times** - เวลาอื่นที่ว่าง
- **Similar Rooms** - ห้องคล้ายกันที่ว่าง

---

## 8️⃣ Settings & Configuration

### Tenant Settings
```typescript
interface TenantConfig {
  // Branding
  name: string;
  logo: string;
  primaryColor: string;
  
  // Booking Defaults
  defaultBookingDuration: number;  // minutes
  minBookingDuration: number;
  maxBookingDuration: number;
  advanceBookingDays: number;
  
  // Policies
  requireApproval: boolean;
  allowRecurring: boolean;
  allowGuestBooking: boolean;
  cancellationPolicy: 'anytime' | 'hours_before';
  cancellationHours: number;
  
  // Working Hours
  workingHours: {
    [day: string]: { start: string; end: string };
  };
  holidays: Date[];
}
```

### User Preferences
```typescript
interface UserPreferences {
  defaultView: 'day' | 'week' | 'month';
  defaultDuration: number;
  timezone: string;
  language: 'th' | 'en';
}
```

---

## 9️⃣ Advanced Features (Phase 2)

### 9.1 AI Features
- **Smart Recommendations** - แนะนำห้องตาม pattern
- **Auto-scheduling** - หาเวลาที่ทุกคนว่าง
- **Usage Predictions** - คาดการณ์ความต้องการ

### 9.2 Integrations
- **Google Calendar** - 2-way sync
- **Outlook Calendar** - 2-way sync

### 9.3 Mobile App
- **Native iOS/Android**
- **QR Code scanner**
- **Offline mode**

---

## 📋 Feature Priority

### Phase 1: MVP (Must Have)
- [ ] User authentication
- [ ] Room listing & detail
- [ ] Basic booking (create/cancel)
- [ ] Calendar views (Day/Week/Month)
- [ ] Admin room management

### Phase 2: Enhancement (Should Have)
- [ ] Recurring bookings
- [ ] Approval workflow
- [ ] Check-in system
- [ ] Analytics dashboard
- [ ] Advanced search & filter
- [ ] User preferences

### Phase 3: Advanced (Nice to Have)
- [ ] Mobile app
- [ ] External calendar sync
- [ ] AI recommendations
- [ ] Advanced analytics
- [ ] API for integrations