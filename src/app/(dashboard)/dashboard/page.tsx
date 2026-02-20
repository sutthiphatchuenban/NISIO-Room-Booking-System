'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUpcomingBookings } from '@/hooks/use-bookings';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    CalendarDays,
    Clock,
    Users,
    TrendingUp,
    Plus,
    ArrowRight,
    Building2,
    CheckCircle,
    Timer,
    BarChart3,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface DashboardStats {
    today: {
        totalBookings: number;
        activeNow: number;
        upcoming: number;
    };
    thisWeek: {
        totalBookings: number;
        utilizationRate: number;
        topRooms: Array<{ roomId: string; name: string; bookings: number }>;
    };
    myBookings: {
        total: number;
        today: number;
        thisWeek: number;
        pendingApproval: number;
    };
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: upcomingBookings, isLoading: isUpcomingLoading } = useUpcomingBookings();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await api.get<DashboardStats>('/dashboard/stats');
                if (res.success && res.data) {
                    setStats(res.data);
                }
            } catch {
                // ignore
            } finally {
                setIsStatsLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'การจองวันนี้',
            value: stats?.today.totalBookings ?? 0,
            icon: CalendarDays,
            description: 'จำนวนการจองทั้งหมดวันนี้',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/50',
            borderColor: 'border-blue-200 dark:border-blue-800',
        },
        {
            title: 'ใช้งานอยู่ตอนนี้',
            value: stats?.today.activeNow ?? 0,
            icon: Timer,
            description: 'ห้องที่มีการใช้งานขณะนี้',
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-950/50',
            borderColor: 'border-green-200 dark:border-green-800',
        },
        {
            title: 'รอดำเนินการ',
            value: stats?.myBookings.pendingApproval ?? 0,
            icon: Clock,
            description: 'การจองที่รออนุมัติ',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/50',
            borderColor: 'border-amber-200 dark:border-amber-800',
        },
        {
            title: 'อัตราการใช้งาน',
            value: `${stats?.thisWeek.utilizationRate ?? 0}%`,
            icon: TrendingUp,
            description: 'สัปดาห์นี้',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/50',
            borderColor: 'border-purple-200 dark:border-purple-800',
        },
    ];

    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        confirmed: { label: 'ยืนยันแล้ว', variant: 'default' },
        pending: { label: 'รออนุมัติ', variant: 'secondary' },
        cancelled: { label: 'ยกเลิก', variant: 'destructive' },
        checked_in: { label: 'เช็คอินแล้ว', variant: 'default' },
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        สวัสดี, {user?.name || 'ผู้ใช้'}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        ยินดีต้อนรับกลับ นี่คือสรุปภาพรวมของคุณ
                    </p>
                </div>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                    <Link href="/rooms">
                        <Plus className="mr-2 h-4 w-4" />
                        จองห้องใหม่
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
                {statCards.map((card, index) => (
                    <Card 
                        key={card.title} 
                        className="relative overflow-hidden card-hover border-0 shadow-sm bg-gradient-to-br from-card to-muted/50"
                    >
                        <div className={`absolute top-0 left-0 w-1 h-full ${card.bg.replace('bg-', 'bg-').replace('dark:bg-', '')}`} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`rounded-xl p-2.5 ${card.bg}`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isStatsLoading ? (
                                <Skeleton className="h-9 w-24" />
                            ) : (
                                <div className="text-3xl font-bold tracking-tight">{card.value}</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1.5">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Upcoming Bookings */}
                <Card className="lg:col-span-4 border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                การจองที่กำลังจะมาถึง
                            </CardTitle>
                            <CardDescription>การจองของคุณที่กำลังจะเกิดขึ้น</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                            <Link href="/bookings">
                                ดูทั้งหมด
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isUpcomingLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-14 w-14 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : upcomingBookings && upcomingBookings.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingBookings.slice(0, 5).map((booking: any, index: number) => (
                                    <Link
                                        key={booking.id}
                                        href={`/bookings/${booking.id}`}
                                        className="flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:bg-accent/50 hover:border-primary/20 hover:shadow-sm group"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold truncate">{booking.title}</p>
                                                <Badge variant={statusMap[booking.status]?.variant || 'outline'} className="text-[10px] font-medium">
                                                    {statusMap[booking.status]?.label || booking.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {booking.roomName || 'ห้อง'} · {format(new Date(booking.startTime), 'dd MMM yyyy HH:mm', { locale: th })}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                                            {formatDistanceToNow(new Date(booking.startTime), { addSuffix: true, locale: th })}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                    <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">ยังไม่มีการจองที่กำลังจะมาถึง</p>
                                <Button variant="link" asChild className="mt-2">
                                    <Link href="/rooms">จองห้องเลย</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Side Panel */}
                <div className="space-y-6 lg:col-span-3">
                    {/* My Stats */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                สถิติของฉัน
                            </CardTitle>
                            <CardDescription>ภาพรวมการจองของคุณ</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isStatsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className="h-8 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <BarChart3 className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">การจองทั้งหมด</span>
                                        </div>
                                        <span className="text-lg font-bold">{stats?.myBookings.total ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <CalendarDays className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium">วันนี้</span>
                                        </div>
                                        <span className="text-lg font-bold">{stats?.myBookings.today ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-green-500" />
                                            </div>
                                            <span className="text-sm font-medium">สัปดาห์นี้</span>
                                        </div>
                                        <span className="text-lg font-bold">{stats?.myBookings.thisWeek ?? 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <span className="text-sm font-medium">รออนุมัติ</span>
                                        </div>
                                        <Badge variant="secondary" className="text-sm px-3 py-1">{stats?.myBookings.pendingApproval ?? 0}</Badge>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Rooms */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                ห้องยอดนิยม
                            </CardTitle>
                            <CardDescription>ห้องที่ถูกจองมากที่สุดในสัปดาห์นี้</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isStatsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-10 w-full" />
                                    ))}
                                </div>
                            ) : stats?.thisWeek.topRooms && stats.thisWeek.topRooms.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.thisWeek.topRooms.map((room, i) => (
                                        <div key={room.roomId} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                                                    i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                                                    i === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                                    i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm font-medium">{room.name}</span>
                                            </div>
                                            <Badge variant="outline" className="font-medium">{room.bookings} จอง</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">ทางลัด</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Button variant="outline" size="sm" asChild className="justify-start h-11 bg-background/50 hover:bg-background border-0 shadow-sm">
                                <Link href="/rooms">
                                    <Building2 className="mr-2 h-4 w-4 text-primary" />
                                    ดูห้องทั้งหมด
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="justify-start h-11 bg-background/50 hover:bg-background border-0 shadow-sm">
                                <Link href="/bookings">
                                    <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                                    การจองของฉัน
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="justify-start h-11 bg-background/50 hover:bg-background border-0 shadow-sm">
                                <Link href="/calendar">
                                    <Clock className="mr-2 h-4 w-4 text-primary" />
                                    ปฏิทิน
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="justify-start h-11 bg-background/50 hover:bg-background border-0 shadow-sm">
                                <Link href="/rooms">
                                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                                    จองเลย
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
