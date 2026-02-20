'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useMyBookings } from '@/hooks/use-bookings';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    User,
    Mail,
    Phone,
    Building2,
    Shield,
    Calendar,
    BarChart3,
    Clock,
    CheckCircle,
    Loader2,
    Eye,
    EyeOff,
    Pencil,
    Save,
    X,
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { toast } from 'sonner';

// Profile form schema
const profileSchema = z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อ').max(255),
    phone: z.string().max(50).optional().or(z.literal('')),
    department: z.string().max(100).optional().or(z.literal('')),
});

// Password form schema
const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
        newPassword: z.string().min(6, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'),
        confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'รหัสผ่านไม่ตรงกัน',
        path: ['confirmPassword'],
    });

export default function ProfilePage() {
    const { user, isLoading: isAuthLoading, updateProfile } = useAuth();
    const { data: bookingsData } = useMyBookings();
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const profileForm = useForm({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
            department: user?.department || '',
        },
    });

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema) as any,
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Sync form when user data loads
    if (user && !profileForm.formState.isDirty && !isEditing) {
        const currentValues = profileForm.getValues();
        if (currentValues.name !== user.name ||
            currentValues.phone !== (user.phone || '') ||
            currentValues.department !== (user.department || '')) {
            profileForm.reset({
                name: user.name,
                phone: user.phone || '',
                department: user.department || '',
            });
        }
    }

    async function onProfileSubmit(values: any) {
        setIsUpdating(true);
        try {
            const result = await updateProfile({
                name: values.name,
                phone: values.phone || undefined,
                department: values.department || undefined,
            });
            if (result.success) {
                toast.success('อัปเดตโปรไฟล์เรียบร้อย');
                setIsEditing(false);
            } else {
                toast.error('อัปเดตไม่สำเร็จ', { description: result.error });
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setIsUpdating(false);
        }
    }

    async function onPasswordSubmit(values: any) {
        setIsChangingPassword(true);
        try {
            const res = await api.post('/users/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            if (res.success) {
                toast.success('เปลี่ยนรหัสผ่านเรียบร้อย');
                passwordForm.reset();
            } else {
                toast.error('เปลี่ยนรหัสผ่านไม่สำเร็จ', {
                    description: res.error?.message || 'กรุณาลองใหม่',
                });
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด');
        } finally {
            setIsChangingPassword(false);
        }
    }

    // Calculate stats
    const bookings = bookingsData?.data || [];
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'completed').length;
    const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled').length;
    const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;

    const roleLabels: Record<string, string> = {
        user: 'ผู้ใช้งาน',
        manager: 'ผู้จัดการ',
        admin: 'แอดมิน',
        super_admin: 'ซูเปอร์แอดมิน',
    };

    const roleColors: Record<string, string> = {
        user: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        manager: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        super_admin: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    };

    if (isAuthLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="h-80" />
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-48" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">โปรไฟล์ของฉัน</h1>
                <p className="text-muted-foreground mt-1">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-semibold">{user?.name}</h2>
                            <p className="text-sm text-muted-foreground">@{user?.username}</p>
                            <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user?.role || 'user']}`}>
                                    <Shield className="h-3 w-3" />
                                    {roleLabels[user?.role || 'user'] || user?.role}
                                </span>
                            </div>
                            <Separator className="my-4" />
                            <div className="w-full space-y-3 text-sm">
                                {user?.department && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        <span>{user.department}</span>
                                    </div>
                                )}
                                {user?.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                {user?.tenant && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        <span>{user.tenant.name}</span>
                                    </div>
                                )}
                                {user?.createdAt && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>สมาชิกตั้งแต่ {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: th })}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">สถิติการจอง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    <span>การจองทั้งหมด</span>
                                </div>
                                <span className="font-bold">{totalBookings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>ยืนยัน / เสร็จสิ้น</span>
                                </div>
                                <span className="font-bold text-green-600">{confirmedBookings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <span>รออนุมัติ</span>
                                </div>
                                <Badge variant="secondary">{pendingBookings}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <X className="h-4 w-4 text-red-500" />
                                    <span>ยกเลิก</span>
                                </div>
                                <span className="font-bold text-red-600">{cancelledBookings}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Edit Profile */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                                <CardDescription>แก้ไขชื่อ, หมายเลขโทรศัพท์ และแผนก</CardDescription>
                            </div>
                            {!isEditing ? (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    แก้ไข
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setIsEditing(false);
                                    profileForm.reset({
                                        name: user?.name || '',
                                        phone: user?.phone || '',
                                        department: user?.department || '',
                                    });
                                }}>
                                    <X className="mr-2 h-4 w-4" />
                                    ยกเลิก
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ชื่อ-นามสกุล</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            className="pl-10"
                                                            disabled={!isEditing || isUpdating}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>หมายเลขโทรศัพท์</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-10"
                                                                placeholder="0xx-xxx-xxxx"
                                                                disabled={!isEditing || isUpdating}
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="department"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>แผนก</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                className="pl-10"
                                                                placeholder="เช่น ฝ่าย IT"
                                                                disabled={!isEditing || isUpdating}
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Read-only fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">ชื่อผู้ใช้</label>
                                            <div className="relative mt-1.5">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-10" value={user?.username || ''} disabled />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">บทบาท</label>
                                            <div className="relative mt-1.5">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-10"
                                                    value={roleLabels[user?.role || 'user'] || user?.role || ''}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex justify-end pt-2">
                                            <Button type="submit" disabled={isUpdating}>
                                                {isUpdating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        กำลังบันทึก...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        บันทึกการเปลี่ยนแปลง
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
                            <CardDescription>ใช้รหัสผ่านที่แข็งแกร่งอย่างน้อย 6 ตัวอักษร</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <FormField
                                        control={passwordForm.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>รหัสผ่านปัจจุบัน</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showCurrentPassword ? 'text' : 'password'}
                                                            disabled={isChangingPassword}
                                                            {...field}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        >
                                                            {showCurrentPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>รหัสผ่านใหม่</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showNewPassword ? 'text' : 'password'}
                                                                disabled={isChangingPassword}
                                                                {...field}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                            >
                                                                {showNewPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            disabled={isChangingPassword}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" variant="outline" disabled={isChangingPassword}>
                                            {isChangingPassword ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    กำลังเปลี่ยน...
                                                </>
                                            ) : (
                                                'เปลี่ยนรหัสผ่าน'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
