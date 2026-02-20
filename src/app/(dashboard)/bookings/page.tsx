'use client';

import { useState } from 'react';
import { useMyBookings, useCancelBooking, useCheckIn } from '@/hooks/use-bookings';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    CalendarDays,
    Building2,
    Clock,
    MapPin,
    Eye,
    X,
    CheckCircle,
    AlertCircle,
    Trash2,
    ClipboardList,
    Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; color: string }> = {
    confirmed: { label: 'ยืนยันแล้ว', variant: 'default', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
    pending: { label: 'รออนุมัติ', variant: 'secondary', icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
    cancelled: { label: 'ยกเลิก', variant: 'destructive', icon: X, color: 'text-red-600 dark:text-red-400' },
    rejected: { label: 'ปฏิเสธ', variant: 'destructive', icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
    checked_in: { label: 'เช็คอินแล้ว', variant: 'default', icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400' },
    completed: { label: 'เสร็จสิ้น', variant: 'outline', icon: CheckCircle, color: 'text-muted-foreground' },
};

export default function BookingsPage() {
    const { data: bookingsData, isLoading } = useMyBookings();
    const cancelBooking = useCancelBooking();
    const checkInBooking = useCheckIn();
    const [activeTab, setActiveTab] = useState('all');
    const [cancelDialog, setCancelDialog] = useState<{ open: boolean; bookingId: string | null }>({
        open: false,
        bookingId: null,
    });

    const now = new Date();
    const bookings: any[] = bookingsData?.data || [];

    const filterBookings = (list: any[]) => {
        switch (activeTab) {
            case 'upcoming':
                return list.filter((b) => new Date(b.startTime) > now && b.status !== 'cancelled');
            case 'past':
                return list.filter((b) => new Date(b.endTime) < now);
            case 'cancelled':
                return list.filter((b) => b.status === 'cancelled' || b.status === 'rejected');
            case 'pending':
                return list.filter((b) => b.status === 'pending');
            default:
                return list;
        }
    };

    const openCancelDialog = (id: string) => {
        setCancelDialog({ open: true, bookingId: id });
    };

    const closeCancelDialog = () => {
        setCancelDialog({ open: false, bookingId: null });
    };

    const handleCancelConfirm = async () => {
        if (!cancelDialog.bookingId) return;

        try {
            await cancelBooking.mutateAsync({ id: cancelDialog.bookingId });
            toast.success('ยกเลิกการจองเรียบร้อย');
        } catch {
            toast.error('ยกเลิกไม่สำเร็จ');
        } finally {
            closeCancelDialog();
        }
    };

    const handleCheckIn = async (id: string) => {
        try {
            await checkInBooking.mutateAsync({ id });
            toast.success('เช็คอินเรียบร้อย');
        } catch {
            toast.error('เช็คอินไม่สำเร็จ');
        }
    };

    const filtered = filterBookings(bookings);

    const tabCounts = {
        all: bookings.length,
        upcoming: bookings.filter((b: any) => new Date(b.startTime) > now && b.status !== 'cancelled').length,
        pending: bookings.filter((b: any) => b.status === 'pending').length,
        past: bookings.filter((b: any) => new Date(b.endTime) < now).length,
        cancelled: bookings.filter((b: any) => b.status === 'cancelled' || b.status === 'rejected').length,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        การจองของฉัน
                    </h1>
                    <p className="text-muted-foreground mt-1">จัดการและติดตามการจองทั้งหมดของคุณ</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                    <Link href="/rooms">
                        <Sparkles className="mr-2 h-4 w-4" />
                        จองห้องใหม่
                    </Link>
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        ทั้งหมด ({tabCounts.all})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        กำลังจะมาถึง ({tabCounts.upcoming})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        รออนุมัติ ({tabCounts.pending})
                    </TabsTrigger>
                    <TabsTrigger value="past" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        ที่ผ่านมา
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        ยกเลิก
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="border-0 shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Skeleton className="h-14 w-14 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                        <Skeleton className="h-9 w-20" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="space-y-3 stagger-children">
                            {filtered.map((booking: any, index: number) => {
                                const status = statusConfig[booking.status] || statusConfig.confirmed;
                                const StatusIcon = status.icon;
                                const isPast = new Date(booking.endTime) < now;
                                const isActive = new Date(booking.startTime) <= now && new Date(booking.endTime) >= now;
                                const canCheckIn = isActive && booking.status === 'confirmed' && !booking.checkedInAt;
                                const canCancel = !isPast && booking.status !== 'cancelled' && booking.status !== 'rejected';

                                return (
                                    <Card 
                                        key={booking.id} 
                                        className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20 transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
                                                    <Building2 className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-semibold truncate">{booking.title}</p>
                                                        <Badge variant={status.variant} className="gap-1 font-medium">
                                                            <StatusIcon className="h-3 w-3" />
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <Building2 className="h-4 w-4" />
                                                            {booking.roomName || 'ห้อง'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <CalendarDays className="h-4 w-4" />
                                                            {format(new Date(booking.startTime), 'dd MMM yyyy', { locale: th })}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4" />
                                                            {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                                                        </span>
                                                        {booking.roomLocation && (
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin className="h-4 w-4" />
                                                                {booking.roomLocation}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {canCheckIn && (
                                                        <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 shadow-lg shadow-green-500/20" onClick={() => handleCheckIn(booking.id)}>
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            เช็คอิน
                                                        </Button>
                                                    )}
                                                    {canCancel && (
                                                        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20" onClick={() => openCancelDialog(booking.id)}>
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            ยกเลิก
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/bookings/${booking.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium">ไม่มีการจอง</h3>
                            <p className="text-sm text-muted-foreground mt-1">ยังไม่มีการจองใน tab นี้</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/rooms">จองห้องใหม่</Link>
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={cancelDialog.open} onOpenChange={(open) => !open && closeCancelDialog()}>
                <AlertDialogContent className="border-0 shadow-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            ยืนยันการยกเลิก
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการยกเลิกการจองนี้ใช่หรือไม่? การจองที่ถูกยกเลิกจะไม่สามารถกู้คืนได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeCancelDialog}>ไม่ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            ยืนยันการยกเลิก
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
