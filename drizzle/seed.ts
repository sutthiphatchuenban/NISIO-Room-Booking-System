import 'dotenv/config';
import { db } from '../src/lib/db';
import { tenants, users, rooms, amenities, roomAmenities, bookings, approvals, approvalRules } from '../src/lib/db/schema';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('🌱 Starting seed...\n');

  // Check if tenant exists
  const existingTenant = await db.query.tenants.findFirst({
    where: (tenants, { eq }) => eq(tenants.slug, 'demo'),
  });

  let tenantId: string;

  if (existingTenant) {
    tenantId = existingTenant.id;
    console.log('ℹ️ Using existing tenant: Demo Company');
    
    // Clear existing data for fresh seed
    console.log('🧹 Clearing existing data...');
    await db.delete(approvalRules);
    await db.delete(approvals);
    await db.delete(bookings);
    await db.delete(roomAmenities);
    await db.delete(rooms);
    await db.delete(amenities);
    await db.delete(users);
    console.log('✅ Cleared existing data');
  } else {
    // Create tenant
    tenantId = uuidv4();
    await db.insert(tenants).values({
      id: tenantId,
      slug: 'demo',
      name: 'Demo Company',
      settings: {
        defaultBookingDuration: 60,
        requireApproval: false,
      },
    });
    console.log('✅ Created tenant: Demo Company');
  }

  // Create users with different roles
  const passwordHash = await hash('password123', 10);
  
  const usersData = [
    {
      id: uuidv4(),
      tenantId,
      username: 'admin',
      passwordHash,
      name: 'System Admin',
      role: 'admin' as const,
      email: 'admin@demo.com',
      department: 'IT',
      isActive: true,
    },
    {
      id: uuidv4(),
      tenantId,
      username: 'manager',
      passwordHash,
      name: 'Manager User',
      role: 'manager' as const,
      email: 'manager@demo.com',
      department: 'Management',
      isActive: true,
    },
    {
      id: uuidv4(),
      tenantId,
      username: 'user1',
      passwordHash,
      name: 'Test User 1',
      role: 'user' as const,
      email: 'user1@demo.com',
      department: 'Engineering',
      isActive: true,
    },
    {
      id: uuidv4(),
      tenantId,
      username: 'user2',
      passwordHash,
      name: 'Test User 2',
      role: 'user' as const,
      email: 'user2@demo.com',
      department: 'Sales',
      isActive: true,
    },
    {
      id: uuidv4(),
      tenantId,
      username: 'inactive',
      passwordHash,
      name: 'Inactive User',
      role: 'user' as const,
      email: 'inactive@demo.com',
      department: 'HR',
      isActive: false,
    },
  ];

  for (const user of usersData) {
    await db.insert(users).values(user);
  }
  console.log(`✅ Created ${usersData.length} users`);
  console.log('   - admin / password123 (Admin)');
  console.log('   - manager / password123 (Manager)');
  console.log('   - user1 / password123 (User)');
  console.log('   - user2 / password123 (User)');
  console.log('   - inactive / password123 (Inactive)');

  // Create amenities
  const amenitiesData = [
    { id: uuidv4(), tenantId, name: 'Projector', icon: 'Projector', description: 'HD Projector with HDMI' },
    { id: uuidv4(), tenantId, name: 'Whiteboard', icon: 'Presentation', description: 'Magnetic whiteboard with markers' },
    { id: uuidv4(), tenantId, name: 'Video Conference', icon: 'Video', description: 'Zoom/Teams ready setup' },
    { id: uuidv4(), tenantId, name: 'TV/Monitor', icon: 'Monitor', description: '55" 4K Display' },
    { id: uuidv4(), tenantId, name: 'Sound System', icon: 'Volume2', description: 'Wireless microphone & speakers' },
    { id: uuidv4(), tenantId, name: 'Air Conditioning', icon: 'Wind', description: 'Individual climate control' },
  ];

  for (const amenity of amenitiesData) {
    await db.insert(amenities).values(amenity);
  }
  console.log(`✅ Created ${amenitiesData.length} amenities`);

  // Create rooms
  const roomsData = [
    {
      id: uuidv4(),
      tenantId,
      name: 'Conference Room A',
      type: 'meeting_room' as const,
      description: 'Large conference room with panoramic view',
      capacity: 20,
      location: 'Building A, Floor 3',
      floor: 3,
      color: '#3b82f6',
      isActive: true,
      requiresApproval: true,
      minBookingDuration: 30,
      maxBookingDuration: 240,
      advanceBookingDays: 30,
    },
    {
      id: uuidv4(),
      tenantId,
      name: 'Meeting Room B',
      type: 'meeting_room' as const,
      description: 'Medium size meeting room',
      capacity: 10,
      location: 'Building A, Floor 2',
      floor: 2,
      color: '#10b981',
      isActive: true,
      requiresApproval: false,
      minBookingDuration: 15,
      maxBookingDuration: 180,
      advanceBookingDays: 14,
    },
    {
      id: uuidv4(),
      tenantId,
      name: 'Phone Booth 1',
      type: 'phone_booth' as const,
      description: 'Private space for phone calls',
      capacity: 2,
      location: 'Building A, Floor 1',
      floor: 1,
      color: '#f59e0b',
      isActive: true,
      requiresApproval: false,
      minBookingDuration: 15,
      maxBookingDuration: 60,
      advanceBookingDays: 7,
    },
    {
      id: uuidv4(),
      tenantId,
      name: 'Quiet Room',
      type: 'quiet_room' as const,
      description: 'Silent workspace for focused work',
      capacity: 4,
      location: 'Building B, Floor 2',
      floor: 2,
      color: '#8b5cf6',
      isActive: true,
      requiresApproval: false,
      minBookingDuration: 30,
      maxBookingDuration: 480,
      advanceBookingDays: 7,
    },
    {
      id: uuidv4(),
      tenantId,
      name: 'Event Space',
      type: 'event_space' as const,
      description: 'Large space for workshops and events',
      capacity: 50,
      location: 'Building A, Ground Floor',
      floor: 0,
      color: '#ef4444',
      isActive: true,
      requiresApproval: true,
      minBookingDuration: 60,
      maxBookingDuration: 480,
      advanceBookingDays: 60,
    },
    {
      id: uuidv4(),
      tenantId,
      name: 'Hot Desk 1',
      type: 'desk' as const,
      description: 'Shared workspace desk',
      capacity: 1,
      location: 'Coworking Area',
      floor: 1,
      color: '#06b6d4',
      isActive: true,
      requiresApproval: false,
      minBookingDuration: 60,
      maxBookingDuration: 480,
      advanceBookingDays: 7,
    },
  ];

  for (const room of roomsData) {
    await db.insert(rooms).values(room);
  }
  console.log(`✅ Created ${roomsData.length} rooms`);

  // Link amenities to rooms
  const roomAmenitiesData = [
    { roomId: roomsData[0].id, amenityId: amenitiesData[0].id }, // Conference A - Projector
    { roomId: roomsData[0].id, amenityId: amenitiesData[1].id }, // Conference A - Whiteboard
    { roomId: roomsData[0].id, amenityId: amenitiesData[2].id }, // Conference A - Video Conference
    { roomId: roomsData[0].id, amenityId: amenitiesData[4].id }, // Conference A - Sound System
    { roomId: roomsData[1].id, amenityId: amenitiesData[0].id }, // Meeting B - Projector
    { roomId: roomsData[1].id, amenityId: amenitiesData[1].id }, // Meeting B - Whiteboard
    { roomId: roomsData[2].id, amenityId: amenitiesData[3].id }, // Phone Booth - TV
    { roomId: roomsData[4].id, amenityId: amenitiesData[0].id }, // Event Space - Projector
    { roomId: roomsData[4].id, amenityId: amenitiesData[2].id }, // Event Space - Video Conference
    { roomId: roomsData[4].id, amenityId: amenitiesData[4].id }, // Event Space - Sound System
  ];

  for (const ra of roomAmenitiesData) {
    await db.insert(roomAmenities).values(ra);
  }
  console.log(`✅ Linked ${roomAmenitiesData.length} room amenities`);

  // Create sample bookings
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookingsData = [
    {
      id: uuidv4(),
      tenantId,
      roomId: roomsData[0].id,
      userId: usersData[0].id,
      title: 'Weekly Team Meeting',
      description: 'Regular sync with the engineering team',
      startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 09:00 today
      endTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),  // 10:00 today
      status: 'confirmed' as const,
      checkedInAt: null as Date | null,
      recurrenceType: 'weekly' as const,
      recurrenceEndDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: uuidv4(),
      tenantId,
      roomId: roomsData[1].id,
      userId: usersData[2].id,
      title: 'Product Review',
      description: 'Review Q1 product roadmap',
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 14:00 today
      endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),   // 15:00 today
      status: 'pending' as const,
      checkedInAt: null as Date | null,
      recurrenceType: 'none' as const,
      recurrenceEndDate: null as Date | null,
    },
    {
      id: uuidv4(),
      tenantId,
      roomId: roomsData[2].id,
      userId: usersData[3].id,
      title: 'Client Call',
      description: 'Call with potential client',
      startTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 today
      endTime: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 today
      status: 'confirmed' as const,
      checkedInAt: new Date(today.getTime() + 11 * 60 * 60 * 1000),
      recurrenceType: 'none' as const,
      recurrenceEndDate: null as Date | null,
    },
    {
      id: uuidv4(),
      tenantId,
      roomId: roomsData[4].id,
      userId: usersData[1].id,
      title: 'Quarterly Workshop',
      description: 'Company-wide quarterly planning',
      startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000), // 09:00 tomorrow
      endTime: new Date(tomorrow.getTime() + 17 * 60 * 60 * 1000),  // 17:00 tomorrow
      status: 'pending' as const,
      checkedInAt: null as Date | null,
      recurrenceType: 'none' as const,
      recurrenceEndDate: null as Date | null,
    },
  ];

  for (const booking of bookingsData) {
    await db.insert(bookings).values(booking as any);
  }
  console.log(`✅ Created ${bookingsData.length} bookings`);

  // Create approval records for pending bookings
  const approvalsData = [
    {
      id: uuidv4(),
      tenantId,
      bookingId: bookingsData[1].id,
      approverId: usersData[1].id, // Manager approves
      status: 'pending' as const,
      comment: null as string | null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      tenantId,
      bookingId: bookingsData[3].id,
      approverId: usersData[0].id, // Admin approves
      status: 'pending' as const,
      comment: null as string | null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const approval of approvalsData) {
    await db.insert(approvals).values(approval as any);
  }
  console.log(`✅ Created ${approvalsData.length} approval records`);

  // Create auto-approval rules
  const rulesData = [
    {
      id: uuidv4(),
      tenantId,
      roomId: null as string | null,
      name: 'Quick Bookings (< 1 hour)',
      conditions: {
        maxDuration: 60,
      },
      userExceptions: {
        allowedRoles: ['admin', 'manager'],
      },
      priority: 10,
      enabled: true,
    },
    {
      id: uuidv4(),
      tenantId,
      roomId: null as string | null,
      name: 'Business Hours Only',
      conditions: {
        allowedTimeStart: '09:00',
        allowedTimeEnd: '18:00',
        allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      },
      userExceptions: {},
      priority: 5,
      enabled: true,
    },
    {
      id: uuidv4(),
      tenantId,
      roomId: roomsData[2].id, // Phone Booth
      name: 'Phone Booth Auto-Approve',
      conditions: {
        maxDuration: 30,
      },
      userExceptions: {
        allowedRoles: ['user', 'manager', 'admin'],
      },
      priority: 20,
      enabled: true,
    },
  ];

  for (const rule of rulesData) {
    await db.insert(approvalRules).values(rule as any);
  }
  console.log(`✅ Created ${rulesData.length} auto-approval rules`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('   Admin:    admin / password123');
  console.log('   Manager:  manager / password123');
  console.log('   User:     user1 / password123');
  console.log('   Inactive: inactive / password123 (account disabled)');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
