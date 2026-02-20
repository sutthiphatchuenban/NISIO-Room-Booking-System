'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Calendar,
    Users,
    Building2,
    CheckCircle,
    XCircle,
    ArrowUpRight,
    Activity,
} from 'lucide-react';

export default function AdminDashboardPage() {
    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ['admin', 'analytics'],
        queryFn: async () => {
            const res = await api.dashboard.analytics({ period: 'month' });
            return res.data;
        },
    });

    const { data: approvalStats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['admin', 'approvalStats'],
        queryFn: async () => {
            const res = await api.admin.approvalStats();
            return res.data;
        },
    });

    const isLoading = isAnalyticsLoading || isStatsLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'การจองทั้งหมด',
            value: (analytics as any)?.bookings?.total || 0,
            icon: Calendar,
            description: 'เดือนนี้',
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/50',
        },
        {
            title: 'อัตราการยกเลิก',
            value: (analytics as any)?.bookings?.total
                ? `${Math.round(((analytics as any)?.bookings?.cancelled / (analytics as any)?.bookings?.total) * 100)}%`
                : '0%',
            icon: XCircle,
            description: `${(analytics as any)?.bookings?.cancelled || 0} รายการ`,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-950/50',
        },
        {
            title: 'ระยะเวลาเฉลี่ย',
            value: `${(analytics as any)?.bookings?.averageDuration || 0} นาที`,
            icon: Clock,
            description: 'ต่อการจอง',
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-950/50',
        },
        {
            title: 'รออนุมัติ',
            value: approvalStats?.pendingCount || 0,
            icon: CheckCircle,
            description: `อนุมัติวันนี้ ${approvalStats?.todayApproved || 0}`,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-950/50',
        },
    ];

    const peakHours = (analytics as any)?.peakHours || [];
    const utilizationByType = (analytics as any)?.utilizationByType || [];
    const trend = (analytics as any)?.trend || [];

    const maxBookings = Math.max(...peakHours.map((h: any) => h.bookings), 1);
    const maxTrend = Math.max(...trend.map((t: any) => t.bookings), 1);

    const roomTypeLabels: Record<string, string> = {
        meeting_room: 'ห้องประชุม',
        desk: 'โต๊ะทำงาน',
        phone_booth: 'ห้องโทรศัพท์',
        event_space: 'พื้นที่จัดงาน',
        quiet_room: 'ห้องเงียบ',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">ภาพรวมการใช้งานระบบจองห้องประชุม</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`rounded-lg p-2 ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <Tabs defaultValue="peak" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="peak">ช่วงเวลายอดนิยม</TabsTrigger>
                    <TabsTrigger value="trend">แนวโน้มการจอง</TabsTrigger>
                    <TabsTrigger value="rooms">ตามประเภทห้อง</TabsTrigger>
                </TabsList>

                {/* Peak Hours */}
                <TabsContent value="peak">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                ช่วงเวลายอดนิยม
                            </CardTitle>
                            <CardDescription>จำนวนการจองตามช่วงเวลาในวัน</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {peakHours.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">ยังไม่มีข้อมูล</p>
                            ) : (
                                <div className="space-y-2">
                                    {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => {
                                        const hourData = peakHours.find((h: any) => h.hour === hour);
                                        const bookings = hourData?.bookings || 0;
                                        const width = maxBookings > 0 ? (bookings / maxBookings) * 100 : 0;

                                        return (
                                            <div key={hour} className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-muted-foreground w-12">
                                                    {String(hour).padStart(2, '0')}:00
                                                </span>
                                                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-linear-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${width}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium w-6 text-right">{bookings}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trend */}
                <TabsContent value="trend">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                แนวโน้มการจองรายวัน
                            </CardTitle>
                            <CardDescription>จำนวนการจองในแต่ละวัน (เดือนนี้)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {trend.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">ยังไม่มีข้อมูล</p>
                            ) : (
                                <div className="flex items-end gap-1 h-48">
                                    {trend.map((day: any, i: number) => {
                                        const height = maxTrend > 0 ? (day.bookings / maxTrend) * 100 : 0;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                                                <span className="text-[10px] font-medium">{day.bookings}</span>
                                                <div
                                                    className="w-full bg-linear-to-t from-primary to-primary/60 rounded-t transition-all duration-500 min-h-[4px]"
                                                    style={{ height: `${Math.max(height, 3)}%` }}
                                                />
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(day.date).getDate()}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Room Types */}
                <TabsContent value="rooms">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                การจองตามประเภทห้อง
                            </CardTitle>
                            <CardDescription>สัดส่วนการใช้งานแต่ละประเภทห้อง</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {utilizationByType.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">ยังไม่มีข้อมูล</p>
                            ) : (
                                <div className="space-y-4">
                                    {utilizationByType.map((item: any) => {
                                        const totalByType = utilizationByType.reduce((s: number, i: any) => s + i.bookings, 0);
                                        const percentage = totalByType > 0 ? Math.round((item.bookings / totalByType) * 100) : 0;
                                        return (
                                            <div key={item.type} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">{roomTypeLabels[item.type] || item.type}</span>
                                                    <span className="text-muted-foreground">{item.bookings} ({percentage}%)</span>
                                                </div>
                                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-linear-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Approval Stats */}
            {approvalStats && (
                <Card>
                    <CardHeader>
                        <CardTitle>สถิติการอนุมัติ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                                <p className="text-2xl font-bold text-amber-600">{approvalStats.pendingCount}</p>
                                <p className="text-sm text-muted-foreground">รออนุมัติ</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                                <p className="text-2xl font-bold text-green-600">{approvalStats.todayApproved}</p>
                                <p className="text-sm text-muted-foreground">อนุมัติวันนี้</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                                <p className="text-2xl font-bold text-red-600">{approvalStats.todayRejected}</p>
                                <p className="text-sm text-muted-foreground">ปฏิเสธวันนี้</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                <p className="text-2xl font-bold text-blue-600">
                                    {Math.round(approvalStats.autoApprovalRate * 100)}%
                                </p>
                                <p className="text-sm text-muted-foreground">อนุมัติอัตโนมัติ</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
