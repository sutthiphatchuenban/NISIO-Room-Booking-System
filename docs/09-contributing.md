# Contributing Guide

## 🤝 Welcome Contributors!

ยินดีต้อนรับสู่ NISIO Room Booking System! เรายินดีรับ contributions จากทุกคน ไม่ว่าจะเป็น:
- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions
- 🎨 UI/UX improvements
- 🌍 Translations

---

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Convention](#commit-message-convention)

---

## 📜 Code of Conduct

### Our Standards
- 🤝 ให้เกียรติซึ่งกันและกัน
- 💬 ให้ feedback ที่สร้างสรรค์
- 🎯 มุ่งเน้นคุณภาพของโค้ด
- 🌍 ยอมรับความหลากหลาย

### Unacceptable Behavior
- การคุกคามหรือดูถูก
- การโจมตีส่วนบุคคล
- การเผยแพร่ข้อมูลส่วนตัว
- พฤติกรรมที่ไม่เหมาะสมอื่นๆ

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
# Fork บน GitHub ก่อน จากนั้น:
git clone https://github.com/YOUR_USERNAME/room-booking-system.git
cd room-booking-system

# Add upstream remote
git remote add upstream https://github.com/nisio/room-booking-system.git
```

### 2. Setup Development Environment
```bash
# ติดตั้ง dependencies
npm install

# Setup environment
cp .env.example .env.local

# Setup database
npx drizzle-kit migrate

# Run dev server
npm run dev
```

### 3. Create Branch
```bash
# อัปเดต main ก่อน
git checkout main
git pull upstream main

# สร้าง feature branch
git checkout -b feature/your-feature-name

# หรือ bugfix branch
git checkout -b fix/bug-description
```

---

## 🔄 Development Workflow

### Branch Naming Convention
| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/recurring-bookings` |
| Bug Fix | `fix/description` | `fix/calendar-timezone` |
| Docs | `docs/description` | `docs/api-examples` |
| Refactor | `refactor/description` | `refactor/booking-service` |
| Test | `test/description` | `test/booking-api` |

### Before You Start
1. ตรวจสอบ [Issues](https://github.com/nisio/room-booking-system/issues) ว่ามีใครกำลังทำอยู่หรือไม่
2. Comment บน issue เพื่อแจ้งว่าคุณจะทำ
3. ถ้าเป็น feature ใหม่ สร้าง issue อธิบายก่อน

### Development Checklist
- [ ] เข้าใจ requirements
- [ ] เขียน tests ก่อน (TDD)
- [ ] Implement feature
- [ ] เขียน documentation
- [ ] Run tests ผ่านทั้งหมด
- [ ] Run linting
- [ ] Test บน local

---

## 📝 Pull Request Process

### 1. Before Creating PR
```bash
# อัปเดต branch
git fetch upstream
git rebase upstream/main

# Run tests
npm test

# Run linting
npm run lint

# Build check
npm run build
```

### 2. Create PR
```bash
# Push branch
git push origin feature/your-feature

# สร้าง PR บน GitHub
```

### 3. PR Template
```markdown
## Description
อธิบายสั้นๆ ว่าทำอะไร

Fixes # (issue number)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests ผ่านทั้งหมด
- [ ] Self-review แล้ว
- [ ] Documentation อัปเดตแล้ว
- [ ] No console.log ที่ไม่จำเป็น

## Screenshots (ถ้ามี UI เปลี่ยน)
```

### 4. PR Review Process
1. Maintainers จะ review ภายใน 3-7 วัน
2. อาจมี request changes
3. Approve แล้วจะ merge เข้า main

---

## 💻 Coding Standards

### TypeScript
```typescript
// ✅ Good
interface BookingProps {
  id: string;
  title: string;
  startTime: Date;
}

function createBooking(props: BookingProps): Booking {
  // implementation
}

// ❌ Bad
function createBooking(id, title, startTime) {
  // missing types
}
```

### React Components
```typescript
// ✅ Good - Functional component with hooks
import { useState } from 'react';

interface RoomCardProps {
  room: Room;
  onBook: (roomId: string) => void;
}

export function RoomCard({ room, onBook }: RoomCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ... */}
    </div>
  );
}

// ❌ Bad - Class component (avoid unless necessary)
class RoomCard extends React.Component {
  // ...
}
```

### File Structure
```
src/
├── components/
│   └── room-card/
│       ├── index.tsx           # Main export
│       ├── room-card.tsx       # Component
│       ├── room-card.test.tsx  # Tests
│       └── types.ts            # Types (ถ้าซับซ้อน)
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `RoomCard.tsx` |
| Hooks | camelCase with use | `useBooking.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_BOOKING_DAYS` |
| Types/Interfaces | PascalCase | `BookingProps` |

### Imports Order
```typescript
// 1. React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { format } from 'date-fns';

// 3. Internal absolute imports
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';

// 4. Internal relative imports
import { RoomList } from './room-list';
import type { Room } from './types';
```

---

## 📝 Commit Message Convention

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code refactoring |
| `test` | Tests |
| `chore` | Build/tools |

### Examples
```bash
# Feature
feat(booking): add recurring booking support

# Bug fix
fix(calendar): correct timezone handling

# Documentation
docs(api): update booking endpoints

# Refactor
refactor(db): optimize booking queries

# Test
test(booking): add unit tests for booking service
```

### Commit Message Tips
- ใช้ present tense ("add" ไม่ใช่ "added")
- ไม่ต้องใส่ตัวพิมพ์ใหญ่ตัวแรก
- ไม่ต้องมีจุดท้ายประโยค

---

## 🧪 Testing Guidelines

### Test Structure
```typescript
// booking-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BookingService } from './booking-service';

describe('BookingService', () => {
  let service: BookingService;
  
  beforeEach(() => {
    service = new BookingService();
  });
  
  describe('createBooking', () => {
    it('should create booking when room is available', async () => {
      // Arrange
      const bookingData = { /* ... */ };
      
      // Act
      const result = await service.createBooking(bookingData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('confirmed');
    });
    
    it('should throw error when room is not available', async () => {
      // ...
    });
  });
});
```

### Test Coverage Goals
- Minimum 70% coverage
- 100% for critical paths
- All API endpoints
- All service functions

---

## 📚 Documentation

### Code Comments
```typescript
/**
 * Check if a room is available for the given time range
 * @param roomId - The room ID to check
 * @param startTime - Start of the time range
 * @param endTime - End of the time range
 * @returns boolean indicating availability
 */
export async function isRoomAvailable(
  roomId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  // implementation
}
```

### Documentation Files
- Update `docs/` เมื่อมี feature ใหม่
- Update `README.md` ถ้ามี breaking changes
- Update `CHANGELOG.md` ก่อน release

---

## 🌍 Translations

### Adding New Language
1. สร้างไฟล์ใน `src/i18n/locales/`
2. Copy จาก `en.json`
3. แปลทั้งหมด
4. Update `src/i18n/config.ts`
5. Test ให้ครบ

### Translation Structure
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "booking": {
    "title": "Book a Room",
    "selectDate": "Select Date"
  }
}
```

---

## 🎨 UI/UX Contributions

### Design System
- ใช้ components จาก shadcn/ui
- ปรับแต่งผ่าน Tailwind classes
- ทำตาม [Design System](./design-system.md)

### Adding New Components
1. ใช้ `npx shadcn@latest add` ถ้ามี
2. ถ้า custom component:
   - สร้างใน `src/components/`
   - มี story (optional)
   - มี tests
   - มี documentation

---

## 🔒 Security

### Security Guidelines
- ไม่ commit secrets
- ใช้ environment variables
- Validate ทุก input
- Use parameterized queries (Drizzle ทำให้อยู่แล้ว)

### Reporting Security Issues
- อย่าเปิด public issue
- สร้าง private security advisory บน GitHub
- รอการตอบกลับภายใน 48 ชั่วโมง

---

## 🏆 Recognition

### Contributors Hall of Fame
Contributors ที่โดดเด่นจะได้รับ:
- ชื่อใน README.md
- Contributor badge
- Early access สำหรับ features ใหม่

---

## 📞 Contact

- 💬 General: [Discussions](https://github.com/nisio/room-booking-system/discussions)
- 🐛 Bugs: [Issues](https://github.com/nisio/room-booking-system/issues)
- 💬 Discord: [Join](https://discord.gg/nisio)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

---

**Thank you for contributing to NISIO Room Booking System! 🎉**