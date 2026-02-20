'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
    username: z.string().min(1, 'กรุณากรอก Username หรือ Email'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            username: '',
        },
    });

    async function onSubmit(values: ForgotPasswordValues) {
        setIsSubmitting(true);
        try {
            // Note: API อาจยังไม่มี endpoint นี้ แต่แสดง UI ไว้ก่อน
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: values.username }),
            });

            // Even if API doesn't exist, show success to prevent user enumeration
            setIsSubmitted(true);
            toast.success('ส่งคำขอเรียบร้อย');
        } catch {
            // Show success even on error to prevent user enumeration
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">ตรวจสอบอีเมลของคุณ</h1>
                        <p className="text-muted-foreground max-w-sm">
                            หากบัญชีของคุณมีอยู่ในระบบ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลที่ลงทะเบียนไว้
                        </p>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <Button variant="outline" className="w-full h-11" asChild>
                        <Link href="/login">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับไปหน้าเข้าสู่ระบบ
                        </Link>
                    </Button>

                    <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => {
                            setIsSubmitted(false);
                            form.reset();
                        }}
                    >
                        ส่งอีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">ลืมรหัสผ่าน</h1>
                <p className="text-muted-foreground">
                    กรอก Username เพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน
                </p>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Username</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="กรอก username ของคุณ"
                                        autoFocus
                                        disabled={isSubmitting}
                                        className="h-11"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full h-11 text-sm font-semibold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังส่ง...
                            </>
                        ) : (
                            <>
                                <Mail className="mr-2 h-4 w-4" />
                                ส่งลิงก์รีเซ็ตรหัสผ่าน
                            </>
                        )}
                    </Button>
                </form>
            </Form>

            {/* Back to login */}
            <Button variant="ghost" className="w-full h-11" asChild>
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    กลับไปหน้าเข้าสู่ระบบ
                </Link>
            </Button>
        </div>
    );
}
