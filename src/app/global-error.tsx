'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
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
        <html>
            <body className="flex h-screen flex-col items-center justify-center space-y-4 text-center bg-background text-foreground">
                <h2 className="text-2xl font-bold">เกิดข้อผิดพลาดร้ายแรง</h2>
                <p className="text-muted-foreground">ระบบไม่สามารถทำงานต่อได้</p>
                <Button onClick={() => reset()}>ลองใหม่อีกครั้ง</Button>
            </body>
        </html>
    );
}
