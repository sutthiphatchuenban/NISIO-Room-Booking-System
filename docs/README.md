# NISIO Room Booking System - Documentation

ยินดีต้อนรับสู่เอกสารประกอบของ **NISIO Room Booking System** - ระบบจองห้องประชุมและโต๊ะทำงานแบบ Open Source 100% ฟรี

## 📚 Table of Contents

### Getting Started
1. **[01-overview.md](./01-overview.md)** - ภาพรวมโปรเจค วิสัยทัศน์ และเป้าหมาย
2. **[08-setup-guide.md](./08-setup-guide.md)** - คู่มือการติดตั้งและเริ่มต้นใช้งาน

### Technical Documentation
3. **[02-architecture.md](./02-architecture.md)** - สถาปัตยกรรมระบบ โครงสร้างโปรเจค และ data flow
4. **[03-database-schema.md](./03-database-schema.md)** - การออกแบบ Database schema ด้วย Drizzle ORM
5. **[07-tech-stack.md](./07-tech-stack.md)** - รายละเอียด Technology Stack ทั้งหมด

### API & Features
6. **[04-api-design.md](./04-api-design.md)** - การออกแบบ REST API endpoints
7. **[05-features.md](./05-features.md)** - รายละเอียดฟีเจอร์ทั้งหมด

### User Experience
8. **[06-user-flows.md](./06-user-flows.md)** - User journey, flows, และ wireframes

### Contributing
9. **[09-contributing.md](./09-contributing.md)** - แนวทางการมีส่วนร่วมในโปรเจค

---

## 🎯 Quick Navigation

| ถ้าคุณต้องการ... | ไปที่ |
|------------------|-------|
| เข้าใจโปรเจคนี้คืออะไร | [01-overview.md](./01-overview.md) |
| ติดตั้งระบบ | [08-setup-guide.md](./08-setup-guide.md) |
| เข้าใจสถาปัตยกรรม | [02-architecture.md](./02-architecture.md) |
| ดูโครงสร้าง Database | [03-database-schema.md](./03-database-schema.md) |
| ใช้งาน API | [04-api-design.md](./04-api-design.md) |
| รู้จักฟีเจอร์ทั้งหมด | [05-features.md](./05-features.md) |
| เข้าใจ User Flows | [06-user-flows.md](./06-user-flows.md) |
| ดู Technology Stack | [07-tech-stack.md](./07-tech-stack.md) |
| มีส่วนร่วมในโปรเจค | [09-contributing.md](./09-contributing.md) |

---

## 🏗️ Documentation Structure

```
docs/
├── README.md                 # ไฟล์นี้ - สารบัญ
├── 01-overview.md            # Project Overview
├── 02-architecture.md        # System Architecture
├── 03-database-schema.md     # Database Schema (Drizzle)
├── 04-api-design.md          # API Design
├── 05-features.md            # Feature Specifications
├── 06-user-flows.md          # User Flows & Journey
├── 07-tech-stack.md          # Technology Stack
├── 08-setup-guide.md         # Installation Guide
└── 09-contributing.md        # Contributing Guidelines
```

---

## 🚀 เริ่มต้นใช้งานอย่างรวดเร็ว

```bash
# 1. Clone repository
git clone https://github.com/nisio/room-booking-system.git
cd room-booking-system

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local

# 4. Setup database
npx drizzle-kit migrate

# 5. Run development server
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## 📝 การมีส่วนร่วม

หากต้องการปรับปรุงเอกสาร:

1. Fork repository
2. แก้ไขไฟล์ใน `/docs`
3. สร้าง Pull Request

---

**Made with ❤️ by NISIO Team**