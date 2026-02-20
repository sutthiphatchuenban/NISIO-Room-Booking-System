'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Loader2, Package, Search } from 'lucide-react';
import { toast } from 'sonner';

const amenitySchema = z.object({
    name: z.string().min(1, 'กรุณากรอกชื่อ').max(100),
    icon: z.string().optional(),
    description: z.string().max(500).optional(),
});

type AmenityFormValues = z.infer<typeof amenitySchema>;

export default function AdminAmenitiesPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch amenities
    const { data: amenities, isLoading } = useQuery({
        queryKey: ['amenities'],
        queryFn: async () => {
            const res = await api.amenities.list();
            return res.data ?? [];
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: AmenityFormValues) => api.amenities.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['amenities'] });
            toast.success('เพิ่มสิ่งอำนวยความสะดวกเรียบร้อย');
            setIsDialogOpen(false);
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: AmenityFormValues }) =>
            api.amenities.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['amenities'] });
            toast.success('อัปเดตเรียบร้อย');
            setIsDialogOpen(false);
            setEditingItem(null);
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.amenities.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['amenities'] });
            toast.success('ลบเรียบร้อย');
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
        },
        onError: () => toast.error('เกิดข้อผิดพลาด'),
    });

    const form = useForm<AmenityFormValues>({
        resolver: zodResolver(amenitySchema),
        defaultValues: {
            name: '',
            icon: '',
            description: '',
        },
    });

    function onSubmit(values: AmenityFormValues) {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    }

    function handleEdit(item: any) {
        setEditingItem(item);
        form.reset({
            name: item.name,
            icon: item.icon || '',
            description: item.description || '',
        });
        setIsDialogOpen(true);
    }

    const filteredAmenities = amenities?.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">สิ่งอำนวยความสะดวก</h1>
                    <p className="text-muted-foreground mt-1">จัดการรายการอุปกรณ์และบริการเสริม</p>
                </div>
                <Button onClick={() => { setEditingItem(null); form.reset(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มรายการ
                </Button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหา..."
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
                                <TableHead>ชื่อ</TableHead>
                                <TableHead>รายละเอียด</TableHead>
                                <TableHead className="w-[100px] text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAmenities?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        ไม่พบรายการ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAmenities?.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    <Package className="h-4 w-4 text-primary" />
                                                </div>
                                                {item.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                    onClick={() => { setDeletingId(item.id); setIsDeleteDialogOpen(true); }}
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</DialogTitle>
                        <DialogDescription>
                            กรอกข้อมูลสิ่งอำนวยความสะดวก
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อสิ่งอำนวยความสะดวก <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น จอโปรเจคเตอร์, Wi-Fi" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รายละเอียด</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="คำอธิบายเพิ่มเติม..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    ยกเลิก
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    บันทึก
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
                        <DialogTitle>ยืนยันการลบ</DialogTitle>
                        <DialogDescription>
                            คุณต้องการลบรายการนี้ใช่หรือไม่?
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
