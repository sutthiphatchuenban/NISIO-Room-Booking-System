// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
}

// ============================================
// Auth Types
// ============================================

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface LoginResponse {
    user: UserProfile;
    tokens: AuthTokens;
}

export interface RegisterResponse {
    user: UserProfile;
    tokens: AuthTokens;
}

// ============================================
// User Types
// ============================================

export type UserRole = 'user' | 'manager' | 'admin' | 'super_admin';

export interface UserProfile {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    department: string | null;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    tenantId: string;
    tenant?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Room Types
// ============================================

export type RoomType = 'meeting_room' | 'desk' | 'phone_booth' | 'event_space' | 'quiet_room';

export interface Room {
    id: string;
    name: string;
    type: RoomType;
    description: string | null;
    capacity: number;
    location: string | null;
    floor: number | null;
    amenities: AmenityInfo[];
    images: string[];
    color: string;
    isActive: boolean;
    requiresApproval: boolean;
    autoApprovalEnabled: boolean;
    minBookingDuration: number | null;
    maxBookingDuration: number | null;
    advanceBookingDays: number | null;
    isAvailable?: boolean;
    nextAvailable?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RoomAvailabilitySlot {
    start: string;
    end: string;
    available: boolean;
    bookingId?: string;
}

export interface RoomAvailabilityDay {
    date: string;
    availableSlots: RoomAvailabilitySlot[];
}

export interface RoomAvailability {
    roomId: string;
    dateRange: { from: string; to: string };
    slots: RoomAvailabilityDay[];
}

// ============================================
// Booking Types
// ============================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Booking {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    recurrenceType: RecurrenceType | null;
    recurrenceEndDate: string | null;
    parentBookingId: string | null;
    checkedInAt: string | null;
    checkedInBy: string | null;
    cancellationReason: string | null;
    cancelledAt: string | null;
    cancelledBy: string | null;
    userId: string;
    roomId: string;
    roomName: string;
    roomType: RoomType;
    roomLocation: string | null;
    roomColor: string;
    user?: {
        id: string;
        name: string;
        username: string;
    };
    room?: {
        id: string;
        name: string;
        type: RoomType;
        location: string | null;
        color: string;
    };
    approval?: {
        status: string;
        approver?: { name: string };
        respondedAt?: string;
        comment?: string;
    };
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Approval Types
// ============================================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PendingApprovalItem {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
    roomId: string;
    roomName: string;
    roomType: RoomType;
    roomLocation: string | null;
    userId: string;
    userName: string;
    userUsername: string;
}

export interface Approval {
    id: string;
    bookingId: string;
    approverId: string;
    status: ApprovalStatus;
    comment: string | null;
    respondedAt: string | null;
    booking: Booking;
    approver: {
        id: string;
        name: string;
        username: string;
    };
    createdAt: string;
}

// ============================================
// Amenity Types
// ============================================

export interface AmenityInfo {
    id: string;
    name: string;
    icon: string;
    description?: string | null;
}

// ============================================
// Auto Approval Types
// ============================================

export interface ApprovalConditions {
    maxDuration?: number;
    maxAdvanceDays?: number;
    allowedDays?: string[];
    allowedTimeStart?: string;
    allowedTimeEnd?: string;
}

export interface UserExceptions {
    allowedUserIds?: string[];
    deniedUserIds?: string[];
    allowedRoles?: UserRole[];
}

export interface ApprovalRule {
    id: string;
    roomId: string | null;
    name: string;
    enabled: boolean;
    conditions: ApprovalConditions;
    userExceptions: UserExceptions;
    priority: number;
    createdAt: string;
    updatedAt: string;
}

export interface AutoApprovalTestResult {
    wouldAutoApprove: boolean;
    matchedRule?: {
        id: string;
        name: string;
    };
    reason: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
    today: {
        totalBookings: number;
        activeNow: number;
        upcoming: number;
    };
    thisWeek: {
        totalBookings: number;
        utilizationRate: number;
        topRooms: Array<{
            roomId: string;
            name: string;
            bookings: number;
        }>;
    };
    myBookings: {
        total: number;
        today: number;
        thisWeek: number;
        pendingApproval: number;
    };
}

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    userName: string;
    roomName: string;
    roomType: RoomType;
    roomColor: string;
}

export interface AnalyticsData {
    utilization: {
        overall: number;
        byRoomType: Record<string, number>;
        trend: Array<{ date: string; rate: number }>;
    };
    bookings: {
        total: number;
        cancelled: number;
        averageDuration: number;
    };
    peakHours: Array<{
        hour: number;
        bookings: number;
    }>;
}

// ============================================
// Admin Types
// ============================================

export interface ApprovalStats {
    pendingCount: number;
    todayApproved: number;
    todayRejected: number;
    autoApprovalRate: number;
    averageApprovalTime: number;
}

export interface ApprovalHistoryItem {
    id: string;
    bookingId: string;
    booking: Booking;
    approverId: string;
    approver: { name: string; username: string };
    status: string;
    comment: string | null;
    respondedAt: string;
    createdAt: string;
}

// ============================================
// Tenant Types
// ============================================

export interface TenantSettings {
    name: string;
    logo?: string;
    settings: {
        defaultBookingDuration?: number;
        requireApproval?: boolean;
        allowRecurring?: boolean;
        workingHours?: {
            start: string;
            end: string;
        };
    };
}

// ============================================
// Navigation / UI Types
// ============================================

export interface NavItem {
    title: string;
    href: string;
    icon: string;
    badge?: number;
    roles?: UserRole[];
    children?: NavItem[];
}
