'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { TooltipProvider } from '@/components/ui/tooltip';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto bg-muted/30">
                        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
