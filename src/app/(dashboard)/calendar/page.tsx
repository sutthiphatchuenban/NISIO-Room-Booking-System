'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Clock,
    Plus,
} from 'lucide-react';
import Link from 'next/link';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarBookingDialog } from '@/components/booking/calendar-booking-dialog';

interface CalendarBooking {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    roomId: string;
    roomName: string;
    roomType: string;
    roomColor: string;
    userId: string;
    userName: string;
}

interface CalendarData {
    view: string;
    dateRange: { start: string; end: string };
    bookings: CalendarBooking[];
}

export default function CalendarPage() {
    const [view, setView] = useState<'day' | 'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{
        date: Date;
        startTime: string;
        endTime: string;
        roomId?: string;
    } | null>(null);

    // Use React Query for calendar data with proper caching and refetching
    const { data, isLoading, refetch } = useQuery<CalendarData>({
        queryKey: ['calendar', view, currentDate.toISOString().split('T')[0]],
        queryFn: async () => {
            const res = await api.get<CalendarData>(
                `/dashboard/calendar?view=${view}&date=${currentDate.toISOString()}`
            );
            if (res.success && res.data) {
                return res.data;
            }
            throw new Error('Failed to fetch calendar data');
        },
    });

    const navigate = (direction: 'prev' | 'next') => {
        const fn = direction === 'next'
            ? view === 'day' ? addDays : view === 'week' ? addWeeks : addMonths
            : view === 'day' ? subDays : view === 'week' ? subWeeks : subMonths;
        setCurrentDate(fn(currentDate, 1));
    };

    const getDateLabel = () => {
        switch (view) {
            case 'day':
                return format(currentDate, 'dd MMMM yyyy', { locale: th });
            case 'week': {
                const ws = startOfWeek(currentDate);
                const we = endOfWeek(currentDate);
                return `${format(ws, 'dd MMM', { locale: th })} - ${format(we, 'dd MMM yyyy', { locale: th })}`;
            }
            case 'month':
                return format(currentDate, 'MMMM yyyy', { locale: th });
        }
    };

    const weekDays = view === 'week'
        ? eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) })
        : [currentDate];

    const getBookingsForDay = (day: Date) => {
        if (!data?.bookings) return [];
        return data.bookings.filter((b) => isSameDay(new Date(b.startTime), day));
    };

    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

    const handleSlotClick = (day: Date, hour: number, existingBookings: CalendarBooking[]) => {
        // Don't allow clicking on slots with existing bookings
        if (existingBookings.length > 0) return;

        const startTime = `${String(hour).padStart(2, '0')}:00`;
        const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

        setSelectedSlot({
            date: day,
            startTime,
            endTime,
        });
        setDialogOpen(true);
    };

    const handleMonthDayClick = (day: Date) => {
        // Switch to day view for the selected date
        setCurrentDate(day);
        setView('day');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">ปฏิทิน</h1>
                    <p className="text-muted-foreground mt-1">ดูภาพรวมการจองห้องทั้งหมด</p>
                </div>
                <Button onClick={() => {
                    setSelectedSlot({
                        date: new Date(),
                        startTime: '09:00',
                        endTime: '10:00',
                    });
                    setDialogOpen(true);
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    สร้างการจอง
                </Button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                        วันนี้
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold ml-2">{getDateLabel()}</span>
                </div>

                <Select value={view} onValueChange={(v) => setView(v as any)}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">วัน</SelectItem>
                        <SelectItem value="week">สัปดาห์</SelectItem>
                        <SelectItem value="month">เดือน</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : view === 'month' ? (
                /* Month View */
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                            {/* Day Headers */}
                            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                                <div key={day} className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days placeholder */}
                            {Array.from({ length: 35 }, (_, i) => {
                                const dayDate = addDays(startOfWeek(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)), i);
                                const dayBookings = getBookingsForDay(dayDate);
                                const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();

                                return (
                                    <div
                                        key={i}
                                        onClick={() => isCurrentMonth && handleMonthDayClick(dayDate)}
                                        className={`min-h-[80px] p-1 bg-background ${!isCurrentMonth ? 'opacity-40' : 'cursor-pointer hover:bg-muted/50'} ${isToday(dayDate) ? 'ring-2 ring-primary ring-inset' : ''}`}
                                    >
                                        <span className={`text-xs font-medium ${isToday(dayDate) ? 'text-primary' : ''}`}>
                                            {format(dayDate, 'd')}
                                        </span>
                                        <div className="mt-1 space-y-0.5">
                                            {dayBookings.slice(0, 2).map((b) => (
                                                <Link
                                                    key={b.id}
                                                    href={`/bookings/${b.id}`}
                                                    className="block text-[10px] px-1 py-0.5 rounded truncate transition-colors hover:opacity-80"
                                                    style={{ backgroundColor: `${b.roomColor || '#6366f1'}33`, color: b.roomColor || '#6366f1' }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {format(new Date(b.startTime), 'HH:mm')} {b.title}
                                                </Link>
                                            ))}
                                            {dayBookings.length > 2 && (
                                                <span className="text-[10px] text-muted-foreground px-1">+{dayBookings.length - 2} อื่นๆ</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Day/Week View */
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-[600px]">
                                {/* Header row */}
                                <div className="grid border-b sticky top-0 bg-background z-10" style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
                                    <div className="border-r p-2"></div>
                                    {weekDays.map((day) => (
                                        <div key={day.toISOString()} className={`border-r last:border-r-0 p-2 text-center ${isToday(day) ? 'bg-primary/5' : ''}`}>
                                            <div className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: th })}</div>
                                            <div className={`text-lg font-bold ${isToday(day) ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Hour rows */}
                                {hours.map((hour) => (
                                    <div key={hour} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
                                        <div className="border-r p-1 text-[10px] text-muted-foreground text-right pr-2 h-14">
                                            {String(hour).padStart(2, '0')}:00
                                        </div>
                                        {weekDays.map((day) => {
                                            // Get bookings that overlap with this hour slot
                                            const dayBookings = getBookingsForDay(day).filter((b) => {
                                                const bookingStart = new Date(b.startTime);
                                                const bookingEnd = new Date(b.endTime);
                                                const bookingStartHour = bookingStart.getHours();
                                                const bookingStartMinute = bookingStart.getMinutes();
                                                const bookingEndHour = bookingEnd.getHours();
                                                const bookingEndMinute = bookingEnd.getMinutes();
                                                
                                                // Convert to decimal hours for easier comparison
                                                const bookingStartTime = bookingStartHour + bookingStartMinute / 60;
                                                const bookingEndTime = bookingEndHour + bookingEndMinute / 60;
                                                const slotStartTime = hour;
                                                const slotEndTime = hour + 1;
                                                
                                                // Booking overlaps if it starts before this slot ends AND ends after this slot starts
                                                return bookingStartTime < slotEndTime && bookingEndTime > slotStartTime;
                                            });

                                            const hasBookings = dayBookings.length > 0;

                                            return (
                                                <div
                                                    key={day.toISOString()}
                                                    onClick={() => handleSlotClick(day, hour, dayBookings)}
                                                    className={`border-r last:border-r-0 p-0.5 h-14 relative ${isToday(day) ? 'bg-primary/5' : ''} ${!hasBookings ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                                                >
                                                    {dayBookings.map((b) => {
                                                        const bookingStart = new Date(b.startTime);
                                                        const isStartHour = bookingStart.getHours() === hour;
                                                        
                                                        return (
                                                            <Link
                                                                key={b.id}
                                                                href={`/bookings/${b.id}`}
                                                                className="block text-[10px] leading-tight px-1 py-0.5 rounded mb-0.5 truncate transition-colors hover:opacity-80 min-h-[20px]"
                                                                style={{ backgroundColor: `${b.roomColor || '#6366f1'}30`, borderLeft: `2px solid ${b.roomColor || '#6366f1'}`, color: b.roomColor || '#6366f1' }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {isStartHour ? (
                                                                    <>
                                                                        <span className="font-medium">{b.title}</span>
                                                                        <br />
                                                                        <span className="opacity-70">{b.roomName}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="opacity-0">.</span>
                                                                )}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Legend */}
            {data?.bookings && data.bookings.length > 0 && (
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>ทั้งหมด {data.bookings.length} การจอง</span>
                </div>
            )}

            {/* Booking Dialog */}
            <CalendarBookingDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialDate={selectedSlot?.date}
                initialStartTime={selectedSlot?.startTime}
                initialEndTime={selectedSlot?.endTime}
                initialRoomId={selectedSlot?.roomId}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
