'use client';

import { use, useState } from 'react';
import { useRoom } from '@/hooks/use-rooms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    MapPin,
    Users,
    Building2,
    Clock,
    CalendarDays,
    ArrowLeft,
    CheckCircle,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import { CreateBookingDialog } from '@/components/booking/create-booking-dialog';

interface RoomDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
    const { id } = use(params);
    const { data: room, isLoading } = useRoom(id);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-lg font-medium">ไม่พบห้อง</h2>
                <p className="text-sm text-muted-foreground mt-1">ห้องนี้อาจถูกลบหรือไม่สามารถเข้าถึงได้</p>
                <Button variant="outline" asChild className="mt-4">
                    <Link href="/rooms">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับไปดูห้องทั้งหมด
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/rooms">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{room.name}</h1>
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: room.color || '#6366f1' }}
                        />
                    </div>
                    {room.description && (
                        <p className="text-muted-foreground text-sm mt-0.5">{room.description}</p>
                    )}
                </div>
                <Button onClick={() => setBookingDialogOpen(true)}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    จองห้องนี้
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Room Image/Placeholder */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="h-64 rounded-lg flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${room.color || '#6366f1'}22, ${room.color || '#6366f1'}44)` }}>
                                <Building2 className="h-16 w-16" style={{ color: room.color || '#6366f1' }} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลห้อง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 p-2">
                                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">ประเภท</p>
                                        <p className="text-sm font-medium capitalize">{room.type?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-50 dark:bg-green-950/50 p-2">
                                        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">รองรับ</p>
                                        <p className="text-sm font-medium">{room.capacity} คน</p>
                                    </div>
                                </div>
                                {room.location && (
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/50 p-2">
                                            <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">ตำแหน่ง</p>
                                            <p className="text-sm font-medium">{room.location}</p>
                                        </div>
                                    </div>
                                )}
                                {room.floor && (
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-purple-50 dark:bg-purple-950/50 p-2">
                                            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">ชั้น</p>
                                            <p className="text-sm font-medium">{room.floor}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {room.amenities && room.amenities.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium mb-2">สิ่งอำนวยความสะดวก</p>
                                        <div className="flex flex-wrap gap-2">
                                            {room.amenities.map((a: any, i: number) => (
                                                <Badge key={i} variant="secondary">
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    {typeof a === 'string' ? a : a.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Side */}
                <div className="space-y-6">
                    {/* Booking Rules */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">กฎการจอง</CardTitle>
                            <CardDescription>เงื่อนไขสำหรับการจองห้องนี้</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {room.requiresApproval && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="h-4 w-4 text-amber-500" />
                                    <span>ต้องได้รับการอนุมัติ</span>
                                </div>
                            )}
                            {room.minBookingDuration && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>จองขั้นต่ำ {room.minBookingDuration} นาที</span>
                                </div>
                            )}
                            {room.maxBookingDuration && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>จองสูงสุด {room.maxBookingDuration} นาที</span>
                                </div>
                            )}
                            {room.advanceBookingDays && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span>จองล่วงหน้าได้ {room.advanceBookingDays} วัน</span>
                                </div>
                            )}
                            {!room.requiresApproval && !room.minBookingDuration && !room.maxBookingDuration && !room.advanceBookingDays && (
                                <p className="text-sm text-muted-foreground">ไม่มีเงื่อนไขพิเศษ</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Book */}
                    <Card>
                        <CardContent className="p-5">
                            <Button className="w-full" size="lg" onClick={() => setBookingDialogOpen(true)}>
                                <CalendarDays className="mr-2 h-5 w-5" />
                                จองห้องนี้
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Booking Dialog */}
            <CreateBookingDialog
                open={bookingDialogOpen}
                onOpenChange={setBookingDialogOpen}
                roomId={id}
                roomName={room.name}
            />
        </div>
    );
}
