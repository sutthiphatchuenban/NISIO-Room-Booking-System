'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
    LayoutDashboard,
    DoorOpen,
    CalendarDays,
    ClipboardList,
    User,
    Shield,
    Settings,
    CheckCircle,
    Users,
    Boxes,
    BarChart3,
    ChevronLeft,
    LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
    badge?: number;
}

const mainNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        title: 'Rooms',
        href: '/rooms',
        icon: <DoorOpen className="h-5 w-5" />,
    },
    {
        title: 'My Bookings',
        href: '/bookings',
        icon: <ClipboardList className="h-5 w-5" />,
    },
    {
        title: 'Calendar',
        href: '/calendar',
        icon: <CalendarDays className="h-5 w-5" />,
    },
    {
        title: 'Approvals',
        href: '/approvals',
        icon: <CheckCircle className="h-5 w-5" />,
        roles: ['manager', 'admin', 'super_admin'],
    },
];

const adminNav: NavItem[] = [
    {
        title: 'Overview',
        href: '/admin',
        icon: <BarChart3 className="h-5 w-5" />,
    },
    {
        title: 'Rooms',
        href: '/admin/rooms',
        icon: <DoorOpen className="h-5 w-5" />,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: <Users className="h-5 w-5" />,
    },
    {
        title: 'Amenities',
        href: '/admin/amenities',
        icon: <Boxes className="h-5 w-5" />,
    },
    {
        title: 'Approvals',
        href: '/admin/approvals',
        icon: <CheckCircle className="h-5 w-5" />,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: <Settings className="h-5 w-5" />,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const isManagerOrAbove = isAdmin || user?.role === 'manager';

    const filteredMainNav = mainNav.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role ?? '');
    });

    return (
        <aside
            className={cn(
                'relative hidden md:flex h-screen flex-col border-r bg-sidebar transition-all duration-300 ease-in-out',
                collapsed ? 'w-[70px]' : 'w-[260px]'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
                    <Image src="/favicon.ico" alt="NISIO Logo" width={40} height={40} className="object-contain" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">NISIO</span>
                        <span className="text-[10px] text-sidebar-foreground/60 truncate">Room Booking</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                {/* Main Navigation */}
                <div className="space-y-1">
                    {!collapsed && (
                        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                            Main
                        </p>
                    )}
                    {filteredMainNav.map((item) => (
                        <NavLink
                            key={item.href}
                            item={item}
                            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                            collapsed={collapsed}
                        />
                    ))}
                </div>

                {/* Admin Navigation */}
                {isAdmin && (
                    <>
                        <Separator className="my-4 bg-sidebar-border/50" />
                        <div className="space-y-1">
                            {!collapsed && (
                                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                                    Admin
                                </p>
                            )}
                            {adminNav.map((item) => (
                                <NavLink
                                    key={item.href}
                                    item={item}
                                    isActive={pathname === item.href}
                                    collapsed={collapsed}
                                />
                            ))}
                        </div>
                    </>
                )}
            </ScrollArea>

            {/* Bottom section */}
            <div className="border-t border-sidebar-border p-3 space-y-1">
                {/* Profile link */}
                <NavLink
                    item={{
                        title: 'Profile',
                        href: '/profile',
                        icon: <User className="h-5 w-5" />,
                    }}
                    isActive={pathname === '/profile'}
                    collapsed={collapsed}
                />
                
                {/* Logout button */}
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all',
                                collapsed && 'justify-center px-2'
                            )}
                            onClick={logout}
                        >
                            <LogOut className="h-5 w-5" />
                            {!collapsed && <span>Logout</span>}
                        </Button>
                    </TooltipTrigger>
                    {collapsed && (
                        <TooltipContent side="right" className="font-medium">
                            Logout
                        </TooltipContent>
                    )}
                </Tooltip>
            </div>

            {/* Collapse toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-sm hover:bg-sidebar-accent transition-all"
                onClick={() => setCollapsed(!collapsed)}
            >
                <ChevronLeft
                    className={cn(
                        'h-3 w-3 transition-transform duration-300',
                        collapsed && 'rotate-180'
                    )}
                />
            </Button>
        </aside>
    );
}

function NavLink({
    item,
    isActive,
    collapsed,
}: {
    item: NavItem;
    isActive: boolean;
    collapsed: boolean;
}) {
    const content = (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                    ? 'bg-sidebar-primary/10 text-sidebar-primary shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-2'
            )}
        >
            <span className={cn(
                'transition-colors',
                isActive ? 'text-sidebar-primary' : ''
            )}>
                {item.icon}
            </span>
            {!collapsed && <span>{item.title}</span>}
            {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
                    {item.badge}
                </span>
            )}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {item.title}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
