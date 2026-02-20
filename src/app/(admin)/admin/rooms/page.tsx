'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    DoorOpen,
    Users,
    MapPin,
    Building2,
    Search,
    Loader2,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Room schema (matching Zod schema from backend)
const roomFormSchema = z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อห้อง').max(255),
    type: z.enum(['meeting_room', 'desk', 'phone_booth', 'event_space', 'quiet_room']),
    description: z.string().optional(),
    capacity: z.coerce.number().min(1, 'ความจุต้องมากกว่า 0'),
    location: z.string().max(255).optional(),
    floor: z.coerce.number().int().optional(),
    amenities: z.array(z.string()).default([]),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'รหัสสีไม่ถูกต้อง').default('#3b82f6'),
    isActive: z.boolean().default(true),
    requiresApproval: z.boolean().default(false),
    autoApprovalEnabled: z.boolean().default(true),
    minBookingDuration: z.coerce.number().min(15).optional(),
    maxBookingDuration: z.coerce.number().min(15).optional(),
    advanceBookingDays: z.coerce.number().min(1).optional(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export default function AdminRoomsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch rooms
    const { data: rooms, isLoading } = useQuery({
        queryKey: ['rooms', 'admin'],
        queryFn: async () => {
            // Use no limit to get all rooms for admin table
            const res = await api.rooms.list({ limit: 100 });
            return res.data ?? [];
        },
    });

    // Fetch amenities for selection
    const { data: amenities } = useQuery({
        queryKey: ['amenities'],
        queryFn: async () => {
            const res = await api.amenities.list();
            return res.data ?? [];
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: RoomFormValues) => api.rooms.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            toast.success('สร้างห้องเรียบร้อย');
            setIsDialogOpen(false);
            form.reset();
        },
        onError: (error: any) => {
            toast.error('เกิดข้อผิดพลาด', { description: error?.message });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: RoomFormValues }) =>
            api.rooms.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            toast.success('อัปเดตห้องเรียบร้อย');
            setIsDialogOpen(false);
            setEditingRoom(null);
            form.reset();
        },
        onError: (error: any) => {
            toast.error('เกิดข้อผิดพลาด', { description: error?.message });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.rooms.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            toast.success('ลบห้องเรียบร้อย');
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    // Form
    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomFormSchema) as any,
        defaultValues: {
            name: '',
            type: 'meeting_room',
            description: '',
            capacity: 4,
            location: '',
            floor: 1,
            amenities: [],
            color: '#3b82f6',
            isActive: true,
            requiresApproval: false,
            autoApprovalEnabled: true,
            minBookingDuration: 30,
            maxBookingDuration: 480,
            advanceBookingDays: 30,
        },
    });

    function onSubmit(values: RoomFormValues) {
        if (editingRoom) {
            updateMutation.mutate({ id: editingRoom.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    }

    function handleEdit(room: any) {
        setEditingRoom(room);
        form.reset({
            name: room.name,
            type: room.type,
            description: room.description || '',
            capacity: room.capacity,
            location: room.location || '',
            floor: room.floor || 1,
            amenities: room.amenities.map((a: any) => typeof a === 'string' ? a : a.id),
            color: room.color,
            isActive: room.isActive,
            requiresApproval: room.requiresApproval,
            autoApprovalEnabled: room.autoApprovalEnabled,
            minBookingDuration: room.minBookingDuration || 30,
            maxBookingDuration: room.maxBookingDuration || 480,
            advanceBookingDays: room.advanceBookingDays || 30,
        });
        setIsDialogOpen(true);
    }

    function handleDelete(id: string) {
        setDeletingId(id);
        setIsDeleteDialogOpen(true);
    }

    const roomTypeLabels: Record<string, string> = {
        meeting_room: 'ห้องประชุม',
        desk: 'โต๊ะทำงาน',
        phone_booth: 'ห้องโทรศัพท์',
        event_space: 'พื้นที่จัดงาน',
        quiet_room: 'ห้องเงียบ',
    };

    const filteredRooms = rooms?.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">จัดการห้องพัก</h1>
                    <p className="text-muted-foreground mt-1">เพิ่ม แก้ไข และจัดการข้อมูลห้องพักและทรัพยากร</p>
                </div>
                <Button onClick={() => { setEditingRoom(null); form.reset(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มห้องใหม่
                </Button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาชื่อห้อง หรือสถานที่..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ชื่อห้อง</TableHead>
                                <TableHead>ประเภท</TableHead>
                                <TableHead>ความจุ</TableHead>
                                <TableHead>สถานที่</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredRooms?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <DoorOpen className="h-10 w-10 mb-2 opacity-20" />
                                            <p>ไม่พบข้อมูลห้องพัก</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRooms?.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: room.color }}
                                                />
                                                {room.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{roomTypeLabels[room.type] || room.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                {room.capacity}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                {room.location || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {room.isActive ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300">
                                                    เปิดใช้งาน
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">ปิดใช้งาน</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(room)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        แก้ไข
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 dark:text-red-400"
                                                        onClick={() => handleDelete(room.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        ลบ
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? 'แก้ไขข้อมูลห้อง' : 'เพิ่มห้องใหม่'}</DialogTitle>
                        <DialogDescription>
                            กรอกข้อมูลรายละเอียดของห้องพักให้ครบถ้วน
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ชื่อห้อง <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="เช่น ห้องประชุม A" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ประเภทห้อง <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="เลือกประเภท" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(roomTypeLabels).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รายละเอียด</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="รายละเอียดเพิ่มเติมของห้อง..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="capacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ความจุ (คน) <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="floor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ชั้น</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ตำแหน่ง/อาคาร</FormLabel>
                                            <FormControl>
                                                <Input placeholder="เช่น อาคาร A" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>สีห้อง</FormLabel>
                                            <div className="space-y-3">
                                                {/* Color Presets */}
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        '#ef4444', '#f97316', '#f59e0b', '#84cc16',
                                                        '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
                                                        '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
                                                        '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
                                                        '#6b7280', '#71717a', '#525252', '#000000',
                                                    ].map((color) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => field.onChange(color)}
                                                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                                field.value === color
                                                                    ? 'border-black dark:border-white scale-110'
                                                                    : 'border-transparent hover:scale-105'
                                                            }`}
                                                            style={{ backgroundColor: color }}
                                                            aria-label={`เลือกสี ${color}`}
                                                        />
                                                    ))}
                                                </div>
                                                {/* Custom Color Input */}
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="color"
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                                    />
                                                    <Input
                                                        placeholder="#000000"
                                                        {...field}
                                                        className="flex-1"
                                                    />
                                                    <div
                                                        className="w-10 h-10 rounded-md border shrink-0"
                                                        style={{ backgroundColor: field.value }}
                                                    />
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amenities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>สิ่งอำนวยความสะดวก</FormLabel>
                                            <FormControl>
                                                <Select
                                                    // Simplified multiselect handling via standard select for demo
                                                    // In real app, use a proper MultiSelect component
                                                    onValueChange={(val) => {
                                                        const current = field.value || [];
                                                        if (!current.includes(val)) {
                                                            field.onChange([...current, val]);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="เลือกสิ่งอำนวยความสะดวก..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {amenities?.map((a) => (
                                                            <SelectItem key={a.id} value={a.id}>
                                                                {a.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {field.value?.map((id) => {
                                                    const amenity = amenities?.find((a) => a.id === id);
                                                    return (
                                                        <Badge key={id} variant="secondary">
                                                            {amenity?.name || id}
                                                            <button
                                                                type="button"
                                                                className="ml-1 hover:text-red-500"
                                                                onClick={() => {
                                                                    field.onChange(field.value?.filter((v) => v !== id));
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-medium text-sm">การตั้งค่าการจอง</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md border">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>เปิดใช้งานห้องนี้</FormLabel>
                                                    <FormDescription>ห้องจะปรากฏให้จองได้</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="requiresApproval"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md border">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>ต้องได้รับอนุมัติ</FormLabel>
                                                    <FormDescription>แมเนเจอร์ต้องอนุมัติก่อนยืนยัน</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingRoom ? 'บันทึกการแก้ไข' : 'สร้างห้องใหม่'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" /> ยืนยันการลบ
                        </DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจหรือไม่ที่จะลบห้องนี้? การกระทำนี้ไม่สามารถย้อนกลับได้ และประวัติการจองทั้งหมดที่เกี่ยวข้องจะถูกลบด้วย
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'ยืนยันลบ'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AlertTriangle({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}
