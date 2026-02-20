
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    LayoutDashboard,
    DoorOpen,
    CalendarDays,
    ClipboardList,
    CheckCircle,
    Menu,
    BarChart3,
    Users,
    Boxes,
    Settings,
    Building2,
    User,
} from 'lucide-react';

const mainNav = [
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
];

const adminNav = [
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

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    const filteredMainNav = mainNav.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role ?? '');
    });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className="px-6 py-4 border-b text-left">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                            <Image src="/favicon.ico" alt="NISIO Logo" width={32} height={32} className="object-contain" />
                        </div>
                        <SheetTitle className="text-base font-bold">NISIO Booking</SheetTitle>
                    </div>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-65px)]">
                    <div className="flex flex-col gap-4 p-4">
                        <div className="space-y-1">
                            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase mb-2">Main</p>
                            {filteredMainNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                        (pathname === item.href || pathname.startsWith(item.href + '/'))
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            ))}
                        </div>

                        {isAdmin && (
                            <>
                                <Separator />
                                <div className="space-y-1">
                                    <p className="px-2 text-xs font-semibold text-muted-foreground uppercase mb-2">Admin</p>
                                    {adminNav.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                                pathname === item.href
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                        <Separator />
                        <Link
                            href="/profile"
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === '/profile'
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </Link>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
