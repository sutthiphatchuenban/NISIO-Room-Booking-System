# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Web App   │  │ Mobile App  │  │  Admin UI   │  │   PWA       │         │
│  │  (Next.js)  │  │  (Future)   │  │  (Next.js)  │  │  (Future)   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API Gateway Layer                                  │
│                    ┌─────────────────────┐                                  │
│                    │    Next.js API      │                                  │
│                    │    (App Router)     │                                  │
│                    │   /app/api/**/*     │                                  │
│                    └──────────┬──────────┘                                  │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Application Layer                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Auth      │  │   Booking   │  │   Room      │  │   User      │         │
│  │   Service   │  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Report    │  │   Resource  │  │   Settings  │                         │
│  │   Service   │  │   Service   │  │   Service   │                         │
│  └─────────────┘  └─────────────┘  └─────────────┘                         │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Data Access Layer                                    │
│                    ┌─────────────────────┐                                  │
│                    │     Drizzle ORM     │                                  │
│                    │   (Type-safe SQL)   │                                  │
│                    └──────────┬──────────┘                                  │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Database Layer                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  PostgreSQL │  │    Redis    │  │    MinIO    │  │    SQLite   │         │
│  │   (Primary) │  │   (Cache)   │  │   (Files)   │  │   (Test)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
room-booking-system/
├── 📁 docs/                    # Documentation
│   ├── 01-overview.md
│   ├── 02-architecture.md
│   ├── 03-database-schema.md
│   ├── 04-api-design.md
│   ├── 05-features.md
│   ├── 06-user-flows.md
│   ├── 07-tech-stack.md
│   ├── 08-setup-guide.md
│   └── 09-contributing.md
│
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 📁 (auth)/          # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── 📁 (dashboard)/     # Dashboard routes group
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── rooms/
│   │   │   └── profile/
│   │   ├── 📁 (admin)/         # Admin routes group
│   │   │   ├── admin/
│   │   │   ├── admin/users/
│   │   │   ├── admin/rooms/
│   │   │   └── admin/settings/
│   │   ├── api/                # API Routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── 📁 components/          # React Components
│   │   ├── 📁 ui/              # UI Components (shadcn/ui)
│   │   ├── 📁 forms/           # Form Components
│   │   ├── 📁 calendar/        # Calendar Components
│   │   └── 📁 layouts/         # Layout Components
│   │
│   ├── 📁 lib/                 # Utilities & Configs
│   │   ├── 📁 db/              # Database
│   │   │   ├── schema.ts       # Drizzle Schema
│   │   │   ├── migrations/     # Database Migrations
│   │   │   └── index.ts        # DB Connection
│   │   ├── 📁 auth/            # Auth Configuration
│   │   └── utils.ts            # Utility Functions
│   │
│   ├── 📁 hooks/               # Custom React Hooks
│   │   ├── use-bookings.ts
│   │   ├── use-rooms.ts
│   │   └── use-auth.ts
│   │
│   ├── 📁 types/               # TypeScript Types
│   │   ├── booking.ts
│   │   ├── room.ts
│   │   └── user.ts
│   │
│   └── 📁 services/            # Business Logic
│       ├── booking-service.ts
│       └── room-service.ts
│
├── 📁 public/                  # Static Assets
├── 📁 tests/                   # Test Files
├── 📄 .env.example
├── 📄 .env.local
├── 📄 drizzle.config.ts
├── 📄 next.config.ts
├── 📄 package.json
├── 📄 tailwind.config.ts
└── 📄 tsconfig.json
```

## 🔄 Data Flow

### Booking Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────▶│   UI     │────▶│   API    │────▶│ Service  │────▶│   DB     │
│  Action  │     │ Component│     │  Route   │     │  Layer   │     │  Layer   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                                         │
                                    ┌────────────────────────────────────┘
```

### Authentication Flow
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶│  Auth   │───▶│  Auth   │───▶│  Auth   │───▶│   DB    │
│  Login  │    │   UI    │    │   API   │    │ Service │    │ (Users) │
└─────────┘    └─────────┘    └─────────┘    └────┬────┘    └─────────┘
                                                   │
                              ┌────────────────────┘
                              ▼
                         ┌─────────┐
                         │  JWT    │
                         │  Token  │
                         └─────────┘
```

## 🔒 Security Architecture

### Authentication
- **NextAuth.js v5** - Modern authentication for Next.js
- **JWT Strategy** - Stateless authentication
- **Session Management** - Secure session handling
- **Password Hashing** - bcrypt with salt rounds 12

### Authorization
```typescript
// Role-based Access Control (RBAC)
enum UserRole {
  USER = 'user',           // จองห้อง/โต๊ะของตัวเอง
  MANAGER = 'manager',     // อนุมัติการจองในสังกัด
  ADMIN = 'admin',         // จัดการทุกอย่างใน tenant
  SUPER_ADMIN = 'super_admin'  // จัดการระบบทั้งหมด
}

// Permission Matrix
const permissions = {
  booking: {
    create: ['user', 'manager', 'admin'],
    read: ['user', 'manager', 'admin'],
    update: ['manager', 'admin'],
    delete: ['admin'],
    approve: ['manager', 'admin']
  },
  room: {
    create: ['admin'],
    read: ['user', 'manager', 'admin'],
    update: ['admin'],
    delete: ['admin']
  }
}
```

### Data Protection
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Drizzle ORM parameterized queries
- **XSS Protection** - React's built-in escaping
- **CSRF Protection** - Next.js built-in protection
- **Rate Limiting** - Upstash Redis rate limiter

## ⚡ Performance Architecture

### Caching Strategy
```
┌─────────────────────────────────────────────────────────┐
│                    Caching Layers                        │
├─────────────────────────────────────────────────────────┤
│  L1: React Query Cache    │  Client-side data cache     │
│  L2: Next.js Cache        │  Route & component cache    │
│  L3: Redis Cache          │  Shared server cache        │
│  L4: Database Query Cache │  PostgreSQL query cache     │
└─────────────────────────────────────────────────────────┘
```

### Optimization Techniques
- **Static Generation** - Pre-render static pages
- **Incremental Static Regeneration** - Update content automatically
- **Image Optimization** - Next.js Image component
- **Code Splitting** - Automatic route-based splitting
- **Database Indexing** - Optimized queries with indexes

## 🌐 Deployment Architecture

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
  
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### Environment Configuration
| Environment | Database | Redis |
|-------------|----------|-------|
| Development | SQLite | In-memory |
| Staging | PostgreSQL | Redis |
| Production | PostgreSQL | Redis |

## 📊 Monitoring & Logging

### Observability Stack
- **Logging** - Pino (structured logging)
- **Metrics** - Vercel Analytics / OpenTelemetry
- **Error Tracking** - Sentry (optional)
- **Uptime** - Health check endpoints

### Health Check Endpoints
```
GET /api/health          → Basic health status
GET /api/health/db       → Database connectivity
GET /api/health/redis    → Redis connectivity