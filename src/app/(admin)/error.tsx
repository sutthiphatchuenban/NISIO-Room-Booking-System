'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">เกิดข้อผิดพลาดในระบบจัดการ</h2>
            <p className="text-muted-foreground max-w-[500px]">
                {error.message || 'ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงหรือลองใหม่อีกครั้ง'}
            </p>
            <div className="flex gap-2 mt-4">
                <Button onClick={() => reset()} variant="default">
                    ลองใหม่อีกครั้ง
                </Button>
                <Button onClick={() => window.location.href = '/admin'} variant="outline">
                    กลับหน้า Overview
                </Button>
            </div>
        </div>
    );
}
