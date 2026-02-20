# 🏢 NISIO Room Booking System

> **ระบบจองห้องประชุมและโต๊ะทำงานแบบ Open Source 100% ฟรี**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)

<p align="center">
  <img src="public/nisio-logo.svg" alt="NISIO Logo" width="200"/>
</p>

---

## ✨ Features

### 🎯 Core Features
- **📅 Room Booking** - จองห้องประชุมได้ง่ายๆ ผ่าน Calendar interface
- **🪑 Desk Booking** - ระบบ Hot Desking สำหรับองค์กรยุคใหม่
- **📊 Calendar Views** - Day/Week/Month view ที่ใช้งานง่าย
- **📱 Mobile Responsive** - ใช้งานได้ทั้งบน Desktop และ Mobile

### 🚀 Advanced Features
- **🔄 Recurring Bookings** - จองซ้ำอัตโนมัติ (รายวัน/สัปดาห์/เดือน)
- **✅ Approval Workflow** - ระบบอนุมัติการจอง
- **🤖 Auto Approval** - อนุมัติอัตโนมัติตามกฎที่ Admin ตั้งค่า
- **📷 QR Code Check-in** - เช็คอินด้วย QR Code
- **📈 Analytics Dashboard** - รายงานการใช้งานพื้นที่
- **🎨 Multi-tenant** - รองรับหลายองค์กรในระบบเดียว

---

## 🖼️ Screenshots

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="800"/>
  <br/>
  <em>Dashboard - ภาพรวมการใช้งาน</em>
</p>

<p align="center">
  <img src="docs/screenshots/calendar.png" alt="Calendar" width="800"/>
  <br/>
  <em>Calendar View - ดูตารางการจอง</em>
</p>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/nisio/room-booking-system.git
cd room-booking-system

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# แก้ไข .env.local ตามการตั้งค่าของคุณ

# 4. Setup database
npx drizzle-kit migrate

# 5. Run development server
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) เพื่อดูผลลัพธ์

📖 **[อ่านคู่มือการติดตั้งฉบับเต็ม](./docs/08-setup-guide.md)**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NISIO Room Booking                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎨 Frontend              🔧 Backend              🗄️ Database    │
│  ─────────────────────────────────────────────────────────────  │
│  Next.js 16               Next.js API             PostgreSQL 16 │
│  React 19                 Drizzle ORM             Redis         │
│  TypeScript 5             NextAuth.js 5                         │
│  Tailwind CSS 4           Zod                                   │
│  shadcn/ui                React Query                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

📖 **[ดูสถาปัตยกรรมระบบฉบับเต็ม](./docs/02-architecture.md)**

---

## 📚 Documentation

เราได้จัดทำเอกสารครบถ้วนสำหรับทุกส่วนของระบบ:

| Document | Description |
|----------|-------------|
| [01-overview](./docs/01-overview.md) | ภาพรวมโปรเจคและวิสัยทัศน์ |
| [02-architecture](./docs/02-architecture.md) | สถาปัตยกรรมระบบ |
| [03-database-schema](./docs/03-database-schema.md) | ออกแบบ Database (Drizzle ORM) |
| [04-api-design](./docs/04-api-design.md) | การออกแบบ API |
| [05-features](./docs/05-features.md) | รายละเอียดฟีเจอร์ |
| [06-user-flows](./docs/06-user-flows.md) | User Journey และ Flows |
| [07-tech-stack](./docs/07-tech-stack.md) | รายละเอียด Technology Stack |
| [08-setup-guide](./docs/08-setup-guide.md) | คู่มือการติดตั้ง |
| [09-contributing](./docs/09-contributing.md) | แนวทางการมีส่วนร่วม |

---

## 🛠️ Tech Stack

### Core
- **[Next.js](https://nextjs.org/)** - React Framework
- **[React](https://react.dev/)** - UI Library
- **[TypeScript](https://www.typescriptlang.org/)** - Type Safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - UI Components

### Backend
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database ORM
- **[NextAuth.js](https://authjs.dev/)** - Authentication
- **[PostgreSQL](https://www.postgresql.org/)** - Database
- **[Zod](https://zod.dev/)** - Schema Validation

- **[TanStack Query](https://tanstack.com/query)** - Data Fetching
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[React Big Calendar](https://github.com/jquense/react-big-calendar)** - Calendar component

---

## 💰 100% Free - No Hidden Costs

| Component | Cost |
|-----------|------|
| Next.js | $0 (Open Source) |
| PostgreSQL | $0 (Self-hosted) |
| Drizzle ORM | $0 (Open Source) |
| **Total** | **$0** |

---

## 🤝 Contributing

เรายินดีรับ contributions จากทุกคน! ไม่ว่าจะเป็น:
- 🐛 Bug fixes
- 💡 New features
- 📝 Documentation
- 🌍 Translations
- 🎨 UI/UX improvements

📖 **[อ่านแนวทางการมีส่วนร่วม](./docs/09-contributing.md)**

### Quick Contributing Guide
```bash
# 1. Fork และ Clone
git clone https://github.com/YOUR_USERNAME/room-booking-system.git

# 2. สร้าง branch
git checkout -b feature/your-feature

# 3. Commit changes
git commit -m "feat: add awesome feature"

# 4. Push และสร้าง Pull Request
git push origin feature/your-feature
```

---

## 📝 License

This project is licensed under the [MIT License](LICENSE) - ใช้งานได้ฟรี แม้ในเชิงพาณิชย์

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Drizzle Team](https://orm.drizzle.team/) - Amazing ORM
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📞 Contact

- 🐛 [Issue Tracker](https://github.com/nisio/room-booking-system/issues)
- 💬 [Discussions](https://github.com/nisio/room-booking-system/discussions)
- 🌐 Website: [https://nisio.dev](https://nisio.dev)

---

<p align="center">
  <strong>Made with ❤️ by NISIO Team</strong>
  <br/>
  <sub>Free forever. Open source always.</sub>
</p>
