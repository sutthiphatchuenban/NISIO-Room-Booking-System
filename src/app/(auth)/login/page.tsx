'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

const loginFormSchema = z.object({
    username: z.string().min(1, 'กรุณากรอก Username'),
    password: z.string().min(1, 'กรุณากรอก Password'),
    rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(loginFormSchema) as any,
        defaultValues: {
            username: '',
            password: '',
            rememberMe: false,
        },
    });

    async function onSubmit(values: any) {
        setIsSubmitting(true);
        try {
            const result = await login(values.username, values.password, values.rememberMe);
            if (result.success) {
                toast.success('เข้าสู่ระบบสำเร็จ', {
                    description: 'กำลังนำคุณไปยัง Dashboard...',
                });
            } else {
                toast.error('เข้าสู่ระบบไม่สำเร็จ', {
                    description: result.error || 'Username หรือ Password ไม่ถูกต้อง',
                });
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด', {
                description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-white">เข้าสู่ระบบ</h1>
                <p className="text-sm text-slate-400">
                    เข้าสู่ระบบเพื่อจัดการการจองห้องประชุมของคุณ
                </p>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-300">Username</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="กรอก username ของคุณ"
                                            autoComplete="username"
                                            autoFocus
                                            disabled={isSubmitting}
                                            className="h-11 pl-10 bg-[#0f172a] border-[#1e293b] text-white placeholder:text-slate-500 focus:border-[#00d9a5] focus:ring-[#00d9a5]/20"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-300">Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="กรอก password ของคุณ"
                                            autoComplete="current-password"
                                            disabled={isSubmitting}
                                            className="h-11 pl-10 pr-10 bg-[#0f172a] border-[#1e293b] text-white placeholder:text-slate-500 focus:border-[#00d9a5] focus:ring-[#00d9a5]/20"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-11 w-11 text-slate-500 hover:text-slate-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                            className="border-slate-600 data-[state=checked]:bg-[#00d9a5] data-[state=checked]:border-[#00d9a5]"
                                        />
                                    </FormControl>
                                    <Label
                                        className="text-sm font-normal text-slate-400 cursor-pointer"
                                        onClick={() => field.onChange(!field.value)}
                                    >
                                        จดจำฉัน
                                    </Label>
                                </FormItem>
                            )}
                        />

                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-[#00d9a5] hover:text-[#00f5b8] transition-colors"
                        >
                            ลืมรหัสผ่าน?
                        </Link>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full h-11 text-sm font-semibold bg-[#00d9a5] hover:bg-[#00c795] text-[#0a0f1c] transition-colors"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังเข้าสู่ระบบ...
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                เข้าสู่ระบบ
                            </>
                        )}
                    </Button>
                </form>
            </Form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#1e293b]" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0a0f1c] px-3 text-slate-500">
                        ยังไม่มีบัญชี?
                    </span>
                </div>
            </div>

            {/* Register Link */}
            <Button className="w-full h-11 group bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155]" asChild>
                <Link href="/register">
                    สร้างบัญชีใหม่
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </Button>
        </div>
    );
}
