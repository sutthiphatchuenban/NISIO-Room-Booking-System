'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Search,
    Shield,
    User,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    UserCheck,
    UserX,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [departmentFilter, setDepartmentFilter] = useState('');

    // Dialog states
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newRole, setNewRole] = useState('');

    // Fetch users
    const { data, isLoading } = useQuery({
        queryKey: ['users', { page, search, role: roleFilter, department: departmentFilter }],
        queryFn: async () => {
            const res = await api.users.list({
                page,
                limit: 10,
                search: search || undefined,
                role: roleFilter === 'all' ? undefined : roleFilter,
                department: departmentFilter || undefined,
            });
            return res;
        },
    });

    // Update role mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) => api.users.updateRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('เปลี่ยนบทบาทสำเร็จ');
            setIsRoleDialogOpen(false);
            setSelectedUser(null);
        },
        onError: (error: any) => {
            toast.error('เกิดข้อผิดพลาด', { description: error?.message || 'ไม่สามารถเปลี่ยนบทบาทได้' });
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.users.updateStatus(id, isActive),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(variables.isActive ? 'เปิดใช้งานบัญชีสำเร็จ' : 'ระงับการใช้งานสำเร็จ');
        },
        onError: (error: any) => {
            toast.error('เกิดข้อผิดพลาด', { description: error?.message || 'ไม่สามารถเปลี่ยนสถานะได้' });
        },
    });

    const users = data?.data || [];
    const meta = data?.meta;

    const roleColors: Record<string, string> = {
        user: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        manager: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        super_admin: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    };

    const roleLabels: Record<string, string> = {
        user: 'ผู้ใช้งาน',
        manager: 'ผู้จัดการ',
        admin: 'แอดมิน',
        super_admin: 'ซูเปอร์แอดมิน',
    };

    function handleOpenRoleDialog(user: any) {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsRoleDialogOpen(true);
    }

    function handleRoleChange() {
        if (selectedUser && newRole) {
            updateRoleMutation.mutate({ id: selectedUser.id, role: newRole });
        }
    }

    function handleToggleStatus(user: any) {
        const newStatus = !user.isActive;
        const action = newStatus ? 'เปิดใช้งาน' : 'ระงับการใช้งาน';
        if (confirm(`คุณต้องการ${action}บัญชีของ "${user.name}" ใช่หรือไม่?`)) {
            updateStatusMutation.mutate({ id: user.id, isActive: newStatus });
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้งาน</h1>
                <p className="text-muted-foreground mt-1">
                    ดูรายชื่อผู้ใช้งาน เปลี่ยนแปลงบทบาท และสถานะบัญชี
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาชื่อ, Username..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="ทุกบทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ทุกบทบาท</SelectItem>
                        <SelectItem value="user">ผู้ใช้งาน</SelectItem>
                        <SelectItem value="manager">ผู้จัดการ</SelectItem>
                        <SelectItem value="admin">แอดมิน</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ผู้ใช้งาน</TableHead>
                                <TableHead>บทบาท</TableHead>
                                <TableHead>แผนก</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>วันที่สมัคร</TableHead>
                                <TableHead className="text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        ไม่พบผู้ใช้งาน
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                                <Shield className="h-3 w-3" />
                                                {roleLabels[user.role]}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {user.department || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {user.isActive ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300">
                                                    ปกติ
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">ระงับการใช้งาน</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: th })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>จัดการบัญชี</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenRoleDialog(user)}>
                                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                                        เปลี่ยนบทบาท
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {user.isActive ? (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleToggleStatus(user)}
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            <UserX className="mr-2 h-4 w-4" />
                                                            ระงับการใช้งาน
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleToggleStatus(user)}
                                                            className="text-green-600 dark:text-green-400"
                                                        >
                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                            เปิดใช้งาน
                                                        </DropdownMenuItem>
                                                    )}
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

            {/* Pagination */}
            {meta && meta.total > meta.limit && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        แสดง {((page - 1) * meta.limit) + 1} - {Math.min(page * meta.limit, meta.total)} จาก {meta.total} รายการ
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> ก่อนหน้า
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page * meta.limit >= meta.total}
                        >
                            ถัดไป <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Role Change Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>เปลี่ยนบทบาทผู้ใช้งาน</DialogTitle>
                        <DialogDescription>
                            {selectedUser && (
                                <>เปลี่ยนบทบาทของ <strong>{selectedUser.name}</strong> (@{selectedUser.username})</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกบทบาท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">ผู้ใช้งาน</SelectItem>
                                <SelectItem value="manager">ผู้จัดการ</SelectItem>
                                <SelectItem value="admin">แอดมิน</SelectItem>
                                <SelectItem value="super_admin">ซูเปอร์แอดมิน</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button 
                            onClick={handleRoleChange}
                            disabled={!newRole || newRole === selectedUser?.role || updateRoleMutation.isPending}
                        >
                            {updateRoleMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
