# Setup Guide

## 🚀 Quick Start

เริ่มต้นใช้งาน NISIO Room Booking System ใน 5 นาที!

### Prerequisites
- Node.js 20+ ([ดาวน์โหลด](https://nodejs.org/))
- PostgreSQL 16+ ([ดาวน์โหลด](https://www.postgresql.org/download/))
- Git ([ดาวน์โหลด](https://git-scm.com/downloads))

---

## 📦 Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/nisio/room-booking-system.git
cd room-booking-system
```

### Step 2: Install Dependencies
```bash
# ใช้ npm
npm install

# หรือใช้ pnpm (แนะนำ - เร็วกว่า)
pnpm install
```

### Step 3: Setup Environment
```bash
# Copy environment file
cp .env.example .env.local

# แก้ไขไฟล์ .env.local ตามการตั้งค่าของคุณ
```

### Step 4: Configure Environment Variables
แก้ไขไฟล์ `.env.local`:

```bash
# Database - ปรับตามการตั้งค่าของคุณ
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/roombooking"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"
# สร้าง secret ด้วยคำสั่ง: openssl rand -base64 32

# App Settings
APP_URL="http://localhost:3000"
APP_NAME="NISIO Room Booking"
```

### Step 5: Setup Database
```bash
# สร้าง database
npx drizzle-kit generate
npx drizzle-kit migrate

# หรือถ้ามี seed data
npm run db:seed
```

### Step 6: Run Development Server
```bash
npm run dev
```

เปิด browser ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Setup (แนะนำสำหรับ Production)

### Using Docker Compose
```bash
# เริ่มทุก service
docker-compose up -d

# ดู logs
docker-compose logs -f app

# หยุดทุก service
docker-compose down
```

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/roombooking
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: roombooking
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

---

## ⚙️ Configuration

### Database Configuration

#### Option 1: Local PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# สร้าง database
createdb roombooking

# สร้าง user (optional)
createuser -P nisio
```

#### Option 2: Docker PostgreSQL
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=roombooking \
  -p 5432:5432 \
  postgres:16-alpine
```

#### Option 3: Cloud PostgreSQL (Free Tier)
- [Supabase](https://supabase.com) - Free tier 500MB
- [Neon](https://neon.tech) - Free tier 500MB
- [Railway](https://railway.app) - $5 free credit

---

## 🗄️ Database Management

### Drizzle ORM Commands
```bash
# Generate migration จาก schema
npx drizzle-kit generate

# รัน migrations
npx drizzle-kit migrate

# เปิด Drizzle Studio (GUI)
npx drizzle-kit studio

# Push schema โดยตรง (สำหรับ development)
npx drizzle-kit push
```

### Database Seeding
```bash
# รัน seed script
npm run db:seed

# หรือใช้ drizzle seed
npx drizzle-kit seed
```

### Backup & Restore
```bash
# Backup
pg_dump -U postgres roombooking > backup.sql

# Restore
psql -U postgres roombooking < backup.sql
```

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run specific test file
npm test -- booking.test.ts

# Run with coverage
npm test -- --coverage
```

### E2E Tests
```bash
# Install playwright
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui
```

---

## 🚀 Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables on Vercel:**
1. ไปที่ Project Settings > Environment Variables
2. เพิ่มตัวแปรทั้งหมดจาก `.env.local`
3. ต้องใช้ external database (Supabase, Neon, etc.)

### Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Self-Hosted (VPS)
```bash
# Build
docker build -t room-booking .

# Run
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=... \
  -e NEXTAUTH_SECRET=... \
  room-booking
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Cannot find module 'drizzle-orm'"
```bash
# แก้ไข
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Database connection failed
```bash
# ตรวจสอบ PostgreSQL กำลังรันอยู่หรือไม่
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# หรือ Docker
docker ps | grep postgres
```

#### Issue: "NEXTAUTH_SECRET is not set"
```bash
# สร้าง secret
openssl rand -base64 32

# หรือ
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ใส่ใน .env.local
```

#### Issue: Port 3000 already in use
```bash
# หา process ที่ใช้ port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# หรือใช้ port อื่น
npm run dev -- --port 3001
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# หรือเฉพาะบาง module
DEBUG=drizzle:* npm run dev
```

---

## 📁 Project Structure Explained

```
room-booking-system/
├── 📁 src/
│   ├── 📁 app/              # Next.js App Router
│   │   ├── 📁 (auth)/       # Routes สำหรับ authentication
│   │   ├── 📁 (dashboard)/  # Routes สำหรับผู้ใช้ทั่วไป
│   │   ├── 📁 (admin)/      # Routes สำหรับ admin
│   │   ├── 📁 api/          # API endpoints
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   │
│   ├── 📁 components/       # React components
│   │   ├── 📁 ui/           # UI components (shadcn)
│   │   ├── 📁 forms/        # Form components
│   │   └── 📁 calendar/     # Calendar components
│   │
│   ├── 📁 lib/              # Utilities & configs
│   │   ├── 📁 db/           # Database (Drizzle)
│   │   ├── 📁 auth/         # Auth config
│   │   └── utils.ts         # Helper functions
│   │
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 types/            # TypeScript types
│   └── 📁 services/         # Business logic
│
├── 📁 docs/                 # Documentation
├── 📁 public/               # Static assets
├── 📁 tests/                # Test files
└── 📁 drizzle/              # Database migrations
```

---

## 🔄 Update Guide

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update all
npm update

# หรือ update เฉพาะบาง package
npm update next react
```

### Migration Guide
```bash
# Backup database ก่อน update
pg_dump -U postgres roombooking > backup-$(date +%Y%m%d).sql

# Update code
git pull origin main

# Update dependencies
npm install

# Run migrations
npx drizzle-kit migrate

# Build
npm run build
```

---

## 📞 Getting Help

- 📖 [Documentation](./README.md)
- 🐛 [Issue Tracker](https://github.com/nisio/room-booking-system/issues)
- 💬 [Discussions](https://github.com/nisio/room-booking-system/discussions)

---

## ✅ Post-Installation Checklist

- [ ] รัน `npm install` สำเร็จ
- [ ] สร้าง `.env.local` แล้ว
- [ ] Database รันอยู่
- [ ] Run migrations สำเร็จ
- [ ] `npm run dev` ทำงานได้
- [ ] เข้า http://localhost:3000 ได้
- [ ] สมัครสมาชิกได้
- [ ] จองห้องได้

---

**🎉 Congratulations! คุณพร้อมใช้งาน NISIO Room Booking System แล้ว!**