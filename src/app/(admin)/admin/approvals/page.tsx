'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    User,
    Calendar,
    Building2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function AdminApprovalHistoryPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'approvalHistory', { page, status: statusFilter, search }],
        queryFn: async () => {
            const res = await api.admin.approvalHistory({
                page,
                limit: 10,
                status: statusFilter === 'all' ? undefined : [statusFilter],
                // search param not directly supported by current History API but we simulated it in UI or could add to backend
                // Assuming backend supports filter by status
            });
            return res;
        },
    });

    const history = (data as any)?.data || []; // Adjust type as needed
    const meta = (data as any)?.meta;

    const statusColors: Record<string, string> = {
        approved: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    };

    const statusLabels: Record<string, string> = {
        approved: 'อนุมัติแล้ว',
        rejected: 'ปฏิเสธ',
        pending: 'รออนุมัติ',
    };

    const statusIcons: Record<string, any> = {
        approved: CheckCircle,
        rejected: XCircle,
        pending: Clock,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">ประวัติการอนุมัติ</h1>
                <p className="text-muted-foreground mt-1">
                    ตรวจสอบประวัติการอนุมัติและการปฏิเสธคำขอจองห้องประชุม
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหา..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="ทุกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ทุกสถานะ</SelectItem>
                        <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                        <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                        <SelectItem value="pending">รออนุมัติ</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>วันที่ทำรายการ</TableHead>
                                <TableHead>การจอง</TableHead>
                                <TableHead>ผู้ขอ</TableHead>
                                <TableHead>ผู้อนุมัติ</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>หมายเหตุ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><div className="space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    </TableRow>
                                ))
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        ไม่พบรายการประวัติ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item: any) => {
                                    const StatusIcon = statusIcons[item.status] || Clock;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-sm font-medium">
                                                {format(new Date(item.createdAt), 'dd MMM yyyy HH:mm', { locale: th })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-sm flex items-center gap-1.5">
                                                        <Building2 className="h-3 w-3 text-muted-foreground" />
                                                        {item.roomName || 'Unknown Room'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {item.bookingTitle || '-'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    {item.requesterName || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {item.approverName || 'ระบบอัตโนมัติ'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${statusColors[item.status]} border-0`}>
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {statusLabels[item.status] || item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground">
                                                {item.comment || '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
        </div>
    );
}
