'use client';

import { use, useState } from 'react';
import { useBooking, useCancelBooking, useCheckIn } from '@/hooks/use-bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
    Building2,
    Clock,
    CalendarDays,
    MapPin,
    ArrowLeft,
    CheckCircle,
    X,
    AlertCircle,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
    confirmed: { label: 'ยืนยันแล้ว', variant: 'default', icon: CheckCircle },
    pending: { label: 'รออนุมัติ', variant: 'secondary', icon: Clock },
    cancelled: { label: 'ยกเลิก', variant: 'destructive', icon: X },
    rejected: { label: 'ปฏิเสธ', variant: 'destructive', icon: AlertCircle },
    checked_in: { label: 'เช็คอินแล้ว', variant: 'default', icon: CheckCircle },
};

interface BookingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
    const { id } = use(params);
    const { data: booking, isLoading } = useBooking(id);
    const cancelBooking = useCancelBooking();
    const checkInBooking = useCheckIn();
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const handleCancel = async () => {
        try {
            await cancelBooking.mutateAsync({ id });
            toast.success('ยกเลิกการจองเรียบร้อย');
        } catch {
            toast.error('ยกเลิกไม่สำเร็จ');
        } finally {
            setShowCancelDialog(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            await checkInBooking.mutateAsync({ id });
            toast.success('เช็คอินเรียบร้อย');
        } catch {
            toast.error('เช็คอินไม่สำเร็จ');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-lg font-medium">ไม่พบการจอง</h2>
                <Button variant="outline" asChild className="mt-4">
                    <Link href="/bookings">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับไปรายการจอง
                    </Link>
                </Button>
            </div>
        );
    }

    const status = statusConfig[booking.status] || statusConfig.confirmed;
    const StatusIcon = status.icon;
    const now = new Date();
    const isPast = new Date(booking.endTime) < now;
    const isActive = new Date(booking.startTime) <= now && new Date(booking.endTime) >= now;
    const canCheckIn = isActive && booking.status === 'confirmed' && !booking.checkedInAt;
    const canCancel = !isPast && booking.status !== 'cancelled' && booking.status !== 'rejected';

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/bookings">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{booking.title}</h1>
                        <Badge variant={status.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>รายละเอียดการจอง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {booking.description && (
                                <p className="text-sm text-muted-foreground">{booking.description}</p>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2">
                                        <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">วันที่</p>
                                        <p className="text-sm font-medium">{format(new Date(booking.startTime), 'dd MMMM yyyy', { locale: th })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-50 dark:bg-green-950/50 p-2">
                                        <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">เวลา</p>
                                        <p className="text-sm font-medium">
                                            {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/50 p-2">
                                        <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">ห้อง</p>
                                        <p className="text-sm font-medium">{booking.roomName || 'N/A'}</p>
                                    </div>
                                </div>
                                {booking.roomLocation && (
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-purple-50 dark:bg-purple-950/50 p-2">
                                            <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">ตำแหน่ง</p>
                                            <p className="text-sm font-medium">{booking.roomLocation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {booking.checkedInAt && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>เช็คอินเมื่อ {format(new Date(booking.checkedInAt), 'dd MMM yyyy HH:mm', { locale: th })}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">การดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {canCheckIn && (
                                <Button className="w-full" onClick={handleCheckIn}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    เช็คอิน
                                </Button>
                            )}
                            {canCancel && (
                                <Button variant="destructive" className="w-full" onClick={() => setShowCancelDialog(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    ยกเลิกการจอง
                                </Button>
                            )}
                            {booking.roomId && (
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/rooms/${booking.roomId}`}>
                                        <Building2 className="mr-2 h-4 w-4" />
                                        ดูข้อมูลห้อง
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">ข้อมูลเพิ่มเติม</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">สถานะ</span>
                                <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            {booking.recurrenceType && booking.recurrenceType !== 'none' && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">การจองซ้ำ</span>
                                    <span className="font-medium">{booking.recurrenceType}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">สร้างเมื่อ</span>
                                <span className="font-medium">{format(new Date(booking.createdAt), 'dd MMM yyyy', { locale: th })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            ยืนยันการยกเลิก
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            คุณต้องการยกเลิกการจองนี้ใช่หรือไม่? การจองที่ถูกยกเลิกจะไม่สามารถกู้คืนได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ไม่ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
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
