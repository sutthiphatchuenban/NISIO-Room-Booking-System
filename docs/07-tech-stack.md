# Technology Stack

## 🎯 Stack Philosophy

> "ใช้เทคโนโลยีฟรีทั้งหมด ไม่มีค่าใช้จ่ายซ่อนเร้น"

NISIO Room Booking System ออกแบบมาเพื่อให้สามารถใช้งานได้ฟรีโดยไม่มีค่าใช้จ่ายใดๆ สำหรับ infrastructure หรือ third-party services

---

## 🏗️ Core Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | Full-stack React framework |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **shadcn/ui** | Latest | UI component library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.x | API endpoints |
| **Drizzle ORM** | 0.40+ | Database ORM |
| **NextAuth.js** | 5.x | Authentication |
| **Zod** | 3.x | Schema validation |

### Database
| Technology | Purpose | Self-Hosted |
|------------|---------|-------------|
| **PostgreSQL** | Primary database | ✅ Yes |
| **Redis** | Caching & Sessions | ✅ Yes |

---

## 📦 Detailed Dependencies

### Production Dependencies
```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    
    "@auth/drizzle-adapter": "^1.0.0",
    "next-auth": "^5.0.0-beta.15",
    
    "drizzle-orm": "^0.40.0",
    "pg": "^8.11.0",
    
    "zod": "^3.22.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.400.0",
    
    "date-fns": "^3.0.0",
    "react-big-calendar": "^1.8.0",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-table": "^8.11.0",
    
    "qrcode": "^1.5.0",
    "uuid": "^9.0.0",
    
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    
    "pino": "^8.17.0",
    "pino-pretty": "^10.3.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/pg": "^8.10.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^9.0.0",
    "@types/qrcode": "^1.5.5",
    
    "drizzle-kit": "^0.30.0",
    
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    "eslint": "^9.0.0",
    "eslint-config-next": "16.1.6",
    
    "@vitejs/plugin-react": "^4.2.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.2.0",
    "jsdom": "^24.0.0"
  }
}
```

---

## 🗄️ Database Stack

### PostgreSQL
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: nisio
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: roombooking
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

**Why PostgreSQL?**
- ✅ Open source & free
- ✅ ACID compliance
- ✅ JSON support
- ✅ Full-text search
- ✅ Excellent performance
- ✅ Widely supported

### Redis (Optional but Recommended)
```yaml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
```

**Use Cases:**
- Session storage
- Rate limiting
- Caching
- Real-time features (future)

---

## 🔐 Authentication Stack

### NextAuth.js v5 (Auth.js)
```typescript
// auth.config.ts
import { NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";

export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      // Username/Password auth
    }),
  ],
  session: {
    strategy: "jwt",
  },
};
```

**Features:**
- JWT-based sessions
- Database adapter (Drizzle)
- Credentials provider
- Session management
- Secure by default

---

## 🎨 UI/UX Stack

### Tailwind CSS Configuration
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*",
    "./src/components/**/*",
    "./src/app/**/*",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ...
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### shadcn/ui Components
```bash
# Install shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add calendar
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add toast
```

---

## 🧪 Testing Stack

### Unit & Integration Tests
```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

### Test Files Structure
```
src/
├── __tests__/
│   ├── unit/
│   │   ├── booking-service.test.ts
│   │   └── room-service.test.ts
│   ├── integration/
│   │   └── api.test.ts
│   └── e2e/
│       └── booking-flow.test.ts
```

---

## 🚀 Deployment Options

### Option 1: Self-Hosted (Docker)
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...
      - NEXTAUTH_SECRET=...
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
  redis_data:
```

### Option 2: Vercel (Free Tier)
```bash
# Deploy to Vercel
vercel --prod
```

**Note:** ต้องใช้ external database (e.g., Supabase, Neon - มี free tier)

### Option 3: Railway / Render (Free Tier)
```bash
# Railway
railway up

# Render
# Connect GitHub repo to Render
```

---

## 🛠️ Development Tools

### Package Manager
- **npm** (default with Node.js)
- **pnpm** (recommended - faster)

### Code Quality
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "Prisma.prisma",
    "yoavbls.pretty-ts-errors"
  ]
}
```

---

## 📊 Performance Stack

### Caching Strategy
```typescript
// lib/cache/redis.ts
import { Redis } from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  async set(key: string, value: unknown, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  },
  
  async invalidate(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};
```

### Image Optimization
- Next.js Image component (automatic)
- WebP format
- Responsive images
- Lazy loading

---

## 🔒 Security Stack

### Security Headers
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};
```

### Input Validation
```typescript
// lib/validations/booking.ts
import { z } from "zod";

export const bookingSchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().min(1).max(255),
  startTime: z.date(),
  endTime: z.date(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
});
```

---

## 🌐 Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/roombooking"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# App
APP_URL="http://localhost:3000"
APP_NAME="NISIO Room Booking"
```

---

## 📚 Documentation Stack

| Tool | Purpose |
|------|---------|
| **Storybook** | Component documentation |
| **TypeDoc** | API documentation |
| **Markdown** | Project documentation |

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

---

## 📋 Tech Stack Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    NISIO ROOM BOOKING                        │
│                      TECH STACK                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎨 FRONTEND          🔧 BACKEND           🗄️ DATABASE      │
│  ─────────────        ───────────          ──────────      │
│  Next.js 16           Next.js API          PostgreSQL 16    │
│  React 19             Drizzle ORM          Redis 7         │
│  TypeScript 5         NextAuth.js 5                        │
│  Tailwind CSS 4       Zod                                  │
│  shadcn/ui            React Query                          │
│                                                             │
│  🧪 TESTING           🚀 DEPLOY                            │
│  ──────────           ─────────                            │
│  Vitest               Docker                               │
│  React Testing        Self-hosted                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 💰 Cost Breakdown (100% Free)

| Component | Cost | Notes |
|-----------|------|-------|
| Next.js | $0 | Open source |
| React | $0 | Open source |
| PostgreSQL | $0 | Self-hosted |
| Redis | $0 | Self-hosted |
| **Total** | **$0** | Completely free! |