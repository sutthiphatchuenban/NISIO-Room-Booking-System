'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBooking } from '@/hooks/use-bookings';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CalendarDays, CheckCircle } from 'lucide-react';

const bookingSchema = z.object({
    title: z.string().min(1, 'กรุณากรอกหัวข้อ'),
    description: z.string().optional(),
    date: z.string().min(1, 'กรุณาเลือกวันที่'),
    startTime: z.string().min(1, 'กรุณาเลือกเวลาเริ่ม'),
    endTime: z.string().min(1, 'กรุณาเลือกเวลาสิ้นสุด'),
});

interface CreateBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomId: string;
    roomName: string;
}

export function CreateBookingDialog({
    open,
    onOpenChange,
    roomId,
    roomName,
}: CreateBookingDialogProps) {
    const createBooking = useCreateBooking();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
        },
    });

    async function onSubmit(values: any) {
        setIsSubmitting(true);
        try {
            const startTime = new Date(`${values.date}T${values.startTime}:00`);
            const endTime = new Date(`${values.date}T${values.endTime}:00`);

            if (endTime <= startTime) {
                toast.error('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม');
                setIsSubmitting(false);
                return;
            }

            await createBooking.mutateAsync({
                roomId,
                title: values.title,
                description: values.description || undefined,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });

            setIsSuccess(true);
            toast.success('จองห้องสำเร็จ!', {
                description: `${roomName} - ${values.date} ${values.startTime}-${values.endTime}`,
            });

            setTimeout(() => {
                setIsSuccess(false);
                form.reset();
                onOpenChange(false);
            }, 2000);
        } catch (err: any) {
            toast.error('จองห้องไม่สำเร็จ', {
                description: err?.message || 'กรุณาลองใหม่อีกครั้ง',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const h = String(i).padStart(2, '0');
        return [`${h}:00`, `${h}:30`];
    }).flat();

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center py-8 text-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold">จองสำเร็จ!</h3>
                        <p className="text-sm text-muted-foreground">
                            การจองห้อง {roomName} ถูกสร้างเรียบร้อยแล้ว
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        จองห้อง {roomName}
                    </DialogTitle>
                    <DialogDescription>กรอกรายละเอียดการจอง</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>หัวข้อ</FormLabel>
                                    <FormControl>
                                        <Input placeholder="เช่น ประชุมทีม, Workshop" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        รายละเอียด <span className="text-muted-foreground font-normal">(ไม่บังคับ)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="รายละเอียดเพิ่มเติม..." rows={2} disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>วันที่</FormLabel>
                                    <FormControl>
                                        <Input type="date" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เวลาเริ่ม</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกเวลา" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {timeSlots.map((t) => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เวลาสิ้นสุด</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกเวลา" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {timeSlots.map((t) => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังจอง...
                                    </>
                                ) : (
                                    'ยืนยันจอง'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
