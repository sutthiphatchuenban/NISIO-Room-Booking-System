'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Save, Building2, ShieldCheck, Clock, Play, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Extended rule schema with user exceptions
const ruleSchema = z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อกฎ'),
    enabled: z.boolean().default(true),
    priority: z.coerce.number().int().default(0),
    conditions: z.object({
        maxDuration: z.coerce.number().optional(),
        maxAdvanceDays: z.coerce.number().optional(),
        allowedTimeStart: z.string().optional(),
        allowedTimeEnd: z.string().optional(),
    }),
    userExceptions: z.object({
        allowedRoles: z.array(z.string()).default([]),
        allowedUserIds: z.array(z.string()).default([]),
        deniedUserIds: z.array(z.string()).default([]),
    }).default({ allowedRoles: [], allowedUserIds: [], deniedUserIds: [] }),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<any | null>(null);
    
    // Test rule dialog state
    const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);

    // Fetch settings
    const { data: autoApproval, isLoading: isRulesLoading } = useQuery({
        queryKey: ['settings', 'autoApproval'],
        queryFn: async () => {
            const res = await api.settings.autoApproval.get();
            return res.data;
        },
    });

    const { data: tenantSettings, isLoading: isTenantLoading } = useQuery({
        queryKey: ['settings', 'tenant'],
        queryFn: async () => {
            const res = await api.settings.tenant.get();
            return res.data;
        },
    });
    
    // Fetch users for test dialog
    const { data: usersList } = useQuery({
        queryKey: ['users', 'all'],
        queryFn: async () => {
            const res = await api.users.list({ limit: 100 });
            return res.data || [];
        },
        enabled: isTestDialogOpen,
    });
    
    // Fetch rooms for test dialog
    const { data: roomsList } = useQuery({
        queryKey: ['rooms', 'all'],
        queryFn: async () => {
            const res = await api.rooms.list({ limit: 100 });
            return res.data || [];
        },
        enabled: isTestDialogOpen,
    });

    // Mutations
    const createRuleMutation = useMutation({
        mutationFn: (data: RuleFormValues) => api.settings.autoApproval.createRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'autoApproval'] });
            toast.success('สร้างกฎเรียบร้อย');
            setIsDialogOpen(false);
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const updateRuleMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: RuleFormValues }) =>
            api.settings.autoApproval.updateRule(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'autoApproval'] });
            toast.success('อัปเดตกฎเรียบร้อย');
            setIsDialogOpen(false);
            setEditingRule(null);
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (id: string) => api.settings.autoApproval.deleteRule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'autoApproval'] });
            toast.success('ลบกฎเรียบร้อย');
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const updateTenantMutation = useMutation({
        mutationFn: (data: any) => api.settings.tenant.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings', 'tenant'] });
            toast.success('บันทึกการตั้งค่าเรียบร้อย');
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });
    
    // Test rule mutation
    const testRuleMutation = useMutation({
        mutationFn: (data: { roomId: string; userId: string; duration: number; startTime: string }) =>
            api.settings.autoApproval.test(data),
        onSuccess: (res) => {
            setTestResult(res.data);
        },
        onError: () => {
            toast.error('ไม่สามารถทดสอบกฎได้');
        },
    });

    // Forms
    const ruleForm = useForm<RuleFormValues>({
        resolver: zodResolver(ruleSchema) as any,
        defaultValues: {
            name: '',
            enabled: true,
            priority: 0,
            conditions: {},
            userExceptions: { allowedRoles: [], allowedUserIds: [], deniedUserIds: [] },
        },
    });

    const tenantForm = useForm({
        defaultValues: {
            name: tenantSettings?.name || '',
            defaultBookingDuration: tenantSettings?.settings?.defaultBookingDuration || 60,
            requireApproval: tenantSettings?.settings?.requireApproval || false,
        },
    });
    
    const testForm = useForm({
        defaultValues: {
            roomId: '',
            userId: '',
            duration: 60,
            startTime: new Date().toISOString().slice(0, 16),
        },
    });

    // Update tenant form when data loads
    if (tenantSettings && !tenantForm.formState.isDirty &&
        (tenantForm.getValues('name') !== tenantSettings.name)) {
        tenantForm.reset({
            name: tenantSettings.name,
            defaultBookingDuration: tenantSettings.settings?.defaultBookingDuration || 60,
            requireApproval: tenantSettings.settings?.requireApproval || false,
        });
    }

    function onRuleSubmit(values: RuleFormValues) {
        if (editingRule) {
            updateRuleMutation.mutate({ id: editingRule.id, data: values });
        } else {
            createRuleMutation.mutate(values);
        }
    }

    function handleEditRule(rule: any) {
        setEditingRule(rule);
        ruleForm.reset({
            name: rule.name,
            enabled: rule.enabled,
            priority: rule.priority,
            conditions: {
                maxDuration: rule.conditions?.maxDuration,
                maxAdvanceDays: rule.conditions?.maxAdvanceDays,
                allowedTimeStart: rule.conditions?.allowedTimeStart,
                allowedTimeEnd: rule.conditions?.allowedTimeEnd,
            },
            userExceptions: {
                allowedRoles: rule.userExceptions?.allowedRoles || [],
                allowedUserIds: rule.userExceptions?.allowedUserIds || [],
                deniedUserIds: rule.userExceptions?.deniedUserIds || [],
            },
        });
        setIsDialogOpen(true);
    }

    function onTenantSubmit(values: any) {
        updateTenantMutation.mutate({
            name: values.name,
            settings: {
                defaultBookingDuration: Number(values.defaultBookingDuration),
                requireApproval: values.requireApproval,
            },
        });
    }
    
    function onTestSubmit(values: any) {
        testRuleMutation.mutate({
            roomId: values.roomId,
            userId: values.userId,
            duration: Number(values.duration),
            startTime: new Date(values.startTime).toISOString(),
        });
    }

    if (isRulesLoading || isTenantLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">การตั้งค่าระบบ</h1>
                <p className="text-muted-foreground mt-1">ตั้งค่าองค์กรและกฎการอนุมัติการจองห้องพัก</p>
            </div>

            <Tabs defaultValue="auto-approval" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="auto-approval">Auto Approval</TabsTrigger>
                    <TabsTrigger value="general">ทั่วไป</TabsTrigger>
                </TabsList>

                {/* Auto Approval Tab */}
                <TabsContent value="auto-approval">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" /> กฎการอนุมัติอัตโนมัติ
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                การจองที่ตรงตามเงื่อนไขเหล่านี้จะได้รับการอนุมัติทันที
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { setTestResult(null); setIsTestDialogOpen(true); }}>
                                <Play className="mr-2 h-4 w-4" /> ทดสอบกฎ
                            </Button>
                            <Button onClick={() => { setEditingRule(null); ruleForm.reset(); setIsDialogOpen(true); }}>
                                <Plus className="mr-2 h-4 w-4" /> เพิ่มกฎใหม่
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ชื่อกฎ</TableHead>
                                        <TableHead>เงื่อนไข</TableHead>
                                        <TableHead>ข้อยกเว้น</TableHead>
                                        <TableHead>ลำดับ</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {autoApproval?.rules?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                ไม่พบกฎการอนุมัติ
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        autoApproval?.rules?.map((rule: any) => (
                                            <TableRow key={rule.id}>
                                                <TableCell className="font-medium">{rule.name}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {rule.conditions?.maxDuration && <li>ไม่เกิน {rule.conditions.maxDuration} นาที</li>}
                                                        {rule.conditions?.maxAdvanceDays && <li>จองล่วงหน้าไม่เกิน {rule.conditions.maxAdvanceDays} วัน</li>}
                                                        {rule.conditions?.allowedTimeStart && <li>เวลา {rule.conditions.allowedTimeStart} - {rule.conditions.allowedTimeEnd}</li>}
                                                        {!rule.conditions?.maxDuration && !rule.conditions?.maxAdvanceDays && !rule.conditions?.allowedTimeStart && <li>ไม่มีเงื่อนไขพิเศษ</li>}
                                                    </ul>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {rule.userExceptions?.allowedRoles?.length > 0 && (
                                                        <div className="text-green-600 dark:text-green-400">
                                                            อนุมัติ: {rule.userExceptions.allowedRoles.join(', ')}
                                                        </div>
                                                    )}
                                                    {rule.userExceptions?.deniedUserIds?.length > 0 && (
                                                        <div className="text-red-600 dark:text-red-400">
                                                            ยกเว้น: {rule.userExceptions.deniedUserIds.length} ผู้ใช้
                                                        </div>
                                                    )}
                                                    {!rule.userExceptions?.allowedRoles?.length && !rule.userExceptions?.deniedUserIds?.length && (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{rule.priority}</TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={rule.enabled}
                                                        onCheckedChange={(checked) =>
                                                            updateRuleMutation.mutate({
                                                                id: rule.id,
                                                                data: { ...rule, enabled: checked }
                                                            })
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditRule(rule)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                            onClick={() => deleteRuleMutation.mutate(rule.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* General Settings Tab */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" /> ตั้งค่าองค์กร
                            </CardTitle>
                            <CardDescription>ข้อมูลพื้นฐานและการตั้งค่าทั่วไปของระบบจอง</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...tenantForm}>
                                <form onSubmit={tenantForm.handleSubmit(onTenantSubmit)} className="space-y-6 max-w-lg">
                                    <FormField
                                        control={tenantForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ชื่อองค์กร</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="เช่น บริษัท กขค จำกัด" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={tenantForm.control}
                                            name="defaultBookingDuration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>เวลาจองเริ่มต้น (นาที)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={tenantForm.control}
                                        name="requireApproval"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        ต้องอนุมัติทุกการจอง
                                                    </FormLabel>
                                                    <FormDescription>
                                                        บังคับให้ทุกการจองต้องผ่านการอนุมัติจากผู้ดูแล
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={updateTenantMutation.isPending}>
                                        {updateTenantMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        <Save className="mr-2 h-4 w-4" />
                                        บันทึกการตั้งค่า
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Rule Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRule ? 'แก้ไขกฎ' : 'เพิ่มกฎใหม่'}</DialogTitle>
                        <DialogDescription>
                            กำหนดเงื่อนไขสำหรับการอนุมัติอัตโนมัติ
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...ruleForm}>
                        <form onSubmit={ruleForm.handleSubmit(onRuleSubmit)} className="space-y-4">
                            <FormField
                                control={ruleForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อกฎ <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น จองสั้นไม่ต้องอนุมัติ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={ruleForm.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ลำดับความสำคัญ</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={ruleForm.control}
                                    name="enabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-2 space-y-0 mt-8">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="font-normal">เปิดใช้งาน</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-3 pt-2 border-t">
                                <h4 className="font-medium text-sm">เงื่อนไข (เว้นว่างหากไม่จำกัด)</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={ruleForm.control}
                                        name="conditions.maxDuration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ระยะเวลาสูงสุด (นาที)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="เช่น 60" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={ruleForm.control}
                                        name="conditions.maxAdvanceDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>จองล่วงหน้าสูงสุด (วัน)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="เช่น 7" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={ruleForm.control}
                                        name="conditions.allowedTimeStart"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>เริ่มเวลา</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={ruleForm.control}
                                        name="conditions.allowedTimeEnd"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ถึงเวลา</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            {/* User Exceptions Section */}
                            <div className="space-y-3 pt-2 border-t">
                                <h4 className="font-medium text-sm">ข้อยกเว้นผู้ใช้งาน</h4>
                                
                                <FormField
                                    control={ruleForm.control}
                                    name="userExceptions.allowedRoles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>บทบาทที่อนุมัติอัตโนมัติเสมอ</FormLabel>
                                            <div className="flex flex-wrap gap-2">
                                                {['admin', 'manager', 'user'].map((role) => (
                                                    <label key={role} className="flex items-center space-x-2 border rounded px-3 py-1.5 cursor-pointer hover:bg-muted">
                                                        <Checkbox 
                                                            checked={field.value?.includes(role)}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([...current, role]);
                                                                } else {
                                                                    field.onChange(current.filter((r: string) => r !== role));
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm capitalize">{role === 'user' ? 'ผู้ใช้งาน' : role === 'manager' ? 'ผู้จัดการ' : 'แอดมิน'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <FormDescription>
                                                ผู้ใช้งานที่มีบทบาทเหล่านี้จะได้รับการอนุมัติอัตโนมัติ
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={createRuleMutation.isPending || updateRuleMutation.isPending}>
                                    บันทึก
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            
            {/* Test Rule Dialog */}
            <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5" /> ทดสอบกฎการอนุมัติ
                        </DialogTitle>
                        <DialogDescription>
                            ทดสอบว่าการจองนี้จะได้รับการอนุมัติอัตโนมัติหรือไม่
                        </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...testForm}>
                        <form onSubmit={testForm.handleSubmit(onTestSubmit)} className="space-y-4">
                            <FormField
                                control={testForm.control}
                                name="roomId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ห้อง</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกห้อง" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roomsList?.map((room: any) => (
                                                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={testForm.control}
                                name="userId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ผู้ใช้งาน</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกผู้ใช้งาน" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {usersList?.map((user: any) => (
                                                    <SelectItem key={user.id} value={user.id}>{user.name} (@{user.username})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={testForm.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ระยะเวลา (นาที)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={testForm.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>วันเวลา</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            {testResult && (
                                <div className={`p-4 rounded-lg border ${testResult.wouldAutoApprove ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResult.wouldAutoApprove ? (
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        )}
                                        <span className={`font-medium ${testResult.wouldAutoApprove ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                            {testResult.wouldAutoApprove ? 'อนุมัติอัตโนมัติ' : 'ต้องรออนุมัติ'}
                                        </span>
                                    </div>
                                    {testResult.reason && (
                                        <p className="text-sm text-muted-foreground">{testResult.reason}</p>
                                    )}
                                    {testResult.matchedRule && (
                                        <p className="text-sm mt-1">
                                            <span className="text-muted-foreground">กฎที่ตรง: </span>
                                            <Badge variant="secondary">{testResult.matchedRule.name}</Badge>
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsTestDialogOpen(false)}>
                                    ปิด
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={testRuleMutation.isPending || !testForm.getValues('roomId') || !testForm.getValues('userId')}
                                >
                                    {testRuleMutation.isPending ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังทดสอบ...</>
                                    ) : (
                                        <><Play className="mr-2 h-4 w-4" /> ทดสอบ</>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
