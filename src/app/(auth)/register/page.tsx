'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, Loader2, User, Lock, Building2, ArrowRight, ArrowLeft } from 'lucide-react';

const registerFormSchema = z
    .object({
        name: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล').max(255),
        username: z
            .string()
            .min(3, 'Username ต้องมีอย่างน้อย 3 ตัวอักษร')
            .max(100)
            .regex(/^[a-zA-Z0-9_.-]+$/, 'Username ใช้ได้เฉพาะ a-z, 0-9, _, -, .'),
        password: z
            .string()
            .min(6, 'Password ต้องมีอย่างน้อย 6 ตัวอักษร'),
        confirmPassword: z.string().min(1, 'กรุณายืนยัน Password'),
        tenantSlug: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password ไม่ตรงกัน',
        path: ['confirmPassword'],
    });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(registerFormSchema) as any,
        defaultValues: {
            name: '',
            username: '',
            password: '',
            confirmPassword: '',
            tenantSlug: '',
        },
    });

    async function onSubmit(values: any) {
        setIsSubmitting(true);
        try {
            const result = await register({
                username: values.username,
                password: values.password,
                name: values.name,
                tenantSlug: values.tenantSlug || undefined,
            });
            if (result.success) {
                toast.success('สร้างบัญชีสำเร็จ!', {
                    description: 'กำลังนำคุณไปยัง Dashboard...',
                });
            } else {
                toast.error('สร้างบัญชีไม่สำเร็จ', {
                    description: result.error || 'กรุณาลองใหม่อีกครั้ง',
                });
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด', {
                description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-white">สร้างบัญชี</h1>
                <p className="text-sm text-slate-400">
                    ลงทะเบียนเพื่อเริ่มใช้งานระบบจองห้องประชุม
                </p>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-300">ชื่อ-นามสกุล</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="เช่น สมชาย ใจดี"
                                            autoComplete="name"
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

                    {/* Username */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-300">Username</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="เช่น somchai.j"
                                            autoComplete="username"
                                            disabled={isSubmitting}
                                            className="h-11 pl-10 bg-[#0f172a] border-[#1e293b] text-white placeholder:text-slate-500 focus:border-[#00d9a5] focus:ring-[#00d9a5]/20"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription className="text-xs text-slate-500">
                                    ใช้สำหรับเข้าสู่ระบบ (a-z, 0-9, _, -, .)
                                </FormDescription>
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
                                            placeholder="อย่างน้อย 6 ตัวอักษร"
                                            autoComplete="new-password"
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
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    {/* Confirm Password */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-300">ยืนยัน Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="กรอก password อีกครั้ง"
                                            autoComplete="new-password"
                                            disabled={isSubmitting}
                                            className="h-11 pl-10 pr-10 bg-[#0f172a] border-[#1e293b] text-white placeholder:text-slate-500 focus:border-[#00d9a5] focus:ring-[#00d9a5]/20"
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-11 w-11 text-slate-500 hover:text-slate-300"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    {/* Tenant Slug (Optional) */}
                    <FormField
                        control={form.control}
                        name="tenantSlug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-300">
                                    รหัสองค์กร{' '}
                                    <span className="text-slate-500 font-normal">(ไม่บังคับ)</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="กรอกรหัสเพื่อเข้าร่วมองค์กรที่มีอยู่"
                                            disabled={isSubmitting}
                                            className="h-11 pl-10 bg-[#0f172a] border-[#1e293b] text-white placeholder:text-slate-500 focus:border-[#00d9a5] focus:ring-[#00d9a5]/20"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription className="text-xs text-slate-500">
                                    หากไม่กรอก ระบบจะสร้างองค์กรใหม่ให้อัตโนมัติ
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full h-11 text-sm font-semibold bg-[#00d9a5] hover:bg-[#00c795] text-[#0a0f1c] transition-colors mt-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                กำลังสร้างบัญชี...
                            </>
                        ) : (
                            <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                สร้างบัญชี
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
                        มีบัญชีอยู่แล้ว?
                    </span>
                </div>
            </div>

            {/* Login Link */}
            <Button className="w-full h-11 group bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155]" asChild>
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    เข้าสู่ระบบ
                </Link>
            </Button>
        </div>
    );
}
