'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { PendingApprovalItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Building2,
    Calendar,
    MapPin,
    Loader2,
    Inbox,
    AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';


export default function ApprovalsPage() {
    const queryClient = useQueryClient();
    const [actionDialog, setActionDialog] = useState<{ type: 'approve' | 'reject'; booking: PendingApprovalItem } | null>(null);
    const [comment, setComment] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['approvals', 'pending'],
        queryFn: async () => {
            const res = await api.approvals.pending();
            return res.data ?? [];
        },
    });

    const approveMutation = useMutation({
        mutationFn: ({ bookingId, comment }: { bookingId: string; comment?: string }) =>
            api.approvals.approve(bookingId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('อนุมัติการจองเรียบร้อย');
            setActionDialog(null);
            setComment('');
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ bookingId, comment }: { bookingId: string; comment?: string }) =>
            api.approvals.reject(bookingId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success('ปฏิเสธการจองเรียบร้อย');
            setActionDialog(null);
            setComment('');
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const pendingBookings = data || [];

    function handleAction() {
        if (!actionDialog) return;
        const { type, booking } = actionDialog;
        if (type === 'approve') {
            approveMutation.mutate({ bookingId: booking.id, comment: comment || undefined });
        } else {
            rejectMutation.mutate({ bookingId: booking.id, comment: comment || undefined });
        }
    }

    const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">อนุมัติการจอง</h1>
                    <p className="text-muted-foreground mt-1">ตรวจสอบและอนุมัติคำขอจองห้องประชุม</p>
                </div>
                <Badge variant="secondary" className="h-8 px-3 text-sm">
                    <Clock className="mr-1.5 h-4 w-4" />
                    {pendingBookings.length} รายการรออนุมัติ
                </Badge>
            </div>

            {/* Empty state */}
            {pendingBookings.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-green-100 dark:bg-green-950 p-4 mb-4">
                            <Inbox className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">ไม่มีรายการรออนุมัติ</h3>
                        <p className="text-sm text-muted-foreground">คำขอจองทั้งหมดได้รับการดำเนินการแล้ว</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                        <Card key={booking.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left Info */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">{booking.title}</h3>
                                            {booking.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{booking.description}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span>{booking.userName} (@{booking.userUsername})</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Building2 className="h-4 w-4" />
                                                <span>{booking.roomName}</span>
                                            </div>
                                            {booking.roomLocation && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{booking.roomLocation}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <span className="font-medium">
                                                {format(new Date(booking.startTime), 'dd MMM yyyy', { locale: th })}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {format(new Date(booking.startTime), 'HH:mm')} -{' '}
                                                {format(new Date(booking.endTime), 'HH:mm')} น.
                                            </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            ส่งคำขอเมื่อ {format(new Date(booking.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                                            onClick={() => setActionDialog({ type: 'reject', booking })}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            ปฏิเสธ
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => setActionDialog({ type: 'approve', booking })}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            อนุมัติ
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Action Dialog */}
            <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setComment(''); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionDialog?.type === 'approve' ? (
                                <><CheckCircle className="h-5 w-5 text-green-600" /> อนุมัติการจอง</>
                            ) : (
                                <><AlertTriangle className="h-5 w-5 text-red-600" /> ปฏิเสธการจอง</>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog?.type === 'approve'
                                ? 'ยืนยันการอนุมัติคำขอจองนี้'
                                : 'ยืนยันการปฏิเสธคำขอจองนี้'}
                        </DialogDescription>
                    </DialogHeader>
                    {actionDialog && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                                <p className="font-medium">{actionDialog.booking.title}</p>
                                <p className="text-muted-foreground">
                                    {actionDialog.booking.roomName} · {format(new Date(actionDialog.booking.startTime), 'dd MMM yyyy HH:mm', { locale: th })}
                                </p>
                                <p className="text-muted-foreground">ผู้ขอ: {actionDialog.booking.userName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">ความคิดเห็น (ไม่บังคับ)</label>
                                <Textarea
                                    className="mt-1.5"
                                    placeholder="เพิ่มความคิดเห็น..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => { setActionDialog(null); setComment(''); }} disabled={isSubmitting}>
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleAction}
                            disabled={isSubmitting}
                            className={actionDialog?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังดำเนินการ...</>
                            ) : actionDialog?.type === 'approve' ? (
                                'ยืนยันอนุมัติ'
                            ) : (
                                'ยืนยันปฏิเสธ'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
