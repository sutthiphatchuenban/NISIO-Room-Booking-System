
import {
    LayoutDashboard,
    DoorOpen,
    CalendarDays,
    ClipboardList,
    CheckCircle,
    BarChart3,
    Users,
    Boxes,
    Settings,
} from 'lucide-react';

export interface NavItem {
    title: string;
    href: string;
    icon: any; // Using any to avoid complex React element type issues in config
    roles?: string[];
    badge?: number;
}

export const mainNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Rooms',
        href: '/rooms',
        icon: DoorOpen,
    },
    {
        title: 'My Bookings',
        href: '/bookings',
        icon: ClipboardList,
    },
    {
        title: 'Calendar',
        href: '/calendar',
        icon: CalendarDays,
    },
    {
        title: 'Approvals',
        href: '/approvals',
        icon: CheckCircle,
        roles: ['manager', 'admin', 'super_admin'],
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export const adminNav: NavItem[] = [
    {
        title: 'Overview',
        href: '/admin',
        icon: BarChart3,
    },
    {
        title: 'Rooms',
        href: '/admin/rooms',
        icon: DoorOpen,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Amenities',
        href: '/admin/amenities',
        icon: Boxes,
    },
    {
        title: 'Approvals',
        href: '/admin/approvals',
        icon: CheckCircle,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];
