
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center bg-background">
            <div className="rounded-full bg-muted p-6">
                <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">404 - ไม่พบหน้าที่ต้องการ</h2>
            <p className="text-muted-foreground max-w-[500px] px-6">
                หน้าที่คุณกำลังมองหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่สามารถใช้งานได้ชั่วคราว
            </p>
            <Button asChild className="mt-4">
                <Link href="/">กลับหน้าหลัก</Link>
            </Button>
        </div>
    );
}
