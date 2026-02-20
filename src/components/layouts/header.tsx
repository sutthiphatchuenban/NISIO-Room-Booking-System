'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import {
    Sun,
    Moon,
    LogOut,
    User,
    Settings,
    Search,
    Bell,
    ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { MobileNav } from './mobile-nav';

export function Header() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? '?';

    const roleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin':
            case 'super_admin':
                return 'default' as const;
            case 'manager':
                return 'secondary' as const;
            default:
                return 'outline' as const;
        }
    };

    const roleLabel = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'Super Admin';
            case 'admin':
                return 'Admin';
            case 'manager':
                return 'Manager';
            default:
                return 'User';
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Left side - Search & Mobile Nav */}
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    <MobileNav />
                </div>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search rooms, bookings..."
                        className="w-[280px] pl-9 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                    <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-accent"
                        >
                            <Avatar className="h-8 w-8 ring-2 ring-border">
                                <AvatarImage src={user?.avatar ?? undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start md:flex">
                                <span className="text-sm font-medium leading-tight">{user?.name ?? 'Loading...'}</span>
                                <span className="text-[11px] text-muted-foreground leading-tight">
                                    {user?.tenant?.name ?? ''}
                                </span>
                            </div>
                            <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                        <DropdownMenuLabel className="flex flex-col gap-1 p-3">
                            <span className="font-semibold">{user?.name}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                                @{user?.username}
                            </span>
                            <Badge
                                variant={roleBadgeVariant(user?.role ?? 'user')}
                                className="mt-1.5 w-fit text-[10px] uppercase font-semibold"
                            >
                                {roleLabel(user?.role ?? 'user')}
                            </Badge>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                            <Link href="/profile">
                                <User className="h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                            <Link href="/admin/settings">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={logout}
                            className="gap-2 text-destructive cursor-pointer focus:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
