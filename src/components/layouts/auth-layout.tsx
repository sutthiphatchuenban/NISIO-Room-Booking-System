'use client';

import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen bg-[#0a0f1c]">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
                {/* Background gradient - Netlify style */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0f172a] to-[#1e293b]" />
                
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(0,217,165,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,165,0.3) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }} />
                </div>
                
                {/* Teal glow effects */}
                <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-[#00d9a5]/10 blur-3xl" />
                <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#00d9a5]/5 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#00d9a5]/5 blur-3xl" />
                
                {/* Floating code-like elements */}
                <div className="absolute top-32 left-16 opacity-20">
                    <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                        <rect x="10" y="10" width="100" height="60" rx="4" stroke="#00d9a5" strokeWidth="1"/>
                        <line x1="25" y1="25" x2="95" y2="25" stroke="#00d9a5" strokeWidth="1" opacity="0.6"/>
                        <line x1="25" y1="35" x2="85" y2="35" stroke="#00d9a5" strokeWidth="1" opacity="0.6"/>
                        <line x1="25" y1="45" x2="75" y2="45" stroke="#00d9a5" strokeWidth="1" opacity="0.6"/>
                        <line x1="25" y1="55" x2="90" y2="55" stroke="#00d9a5" strokeWidth="1" opacity="0.6"/>
                    </svg>
                </div>
                
                <div className="absolute bottom-40 right-20 opacity-20">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="40" stroke="#00d9a5" strokeWidth="1"/>
                        <circle cx="50" cy="50" r="30" stroke="#00d9a5" strokeWidth="1" opacity="0.6"/>
                        <line x1="50" y1="50" x2="75" y2="35" stroke="#00d9a5" strokeWidth="2"/>
                        <circle cx="50" cy="50" r="4" fill="#00d9a5"/>
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-start justify-center px-12 xl:px-20">
                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden">
                            <Image src="/favicon.ico" alt="NISIO Logo" width={56} height={56} className="object-contain" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">NISIO</h2>
                            <p className="text-sm text-slate-400 font-medium">Room Booking System</p>
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                        จองห้องประชุม
                        <br />
                        <span className="text-[#00d9a5]">ง่าย เร็ว สะดวก</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-12">
                        ระบบจัดการห้องประชุมและโต๊ะทำงานแบบครบวงจร
                        ออกแบบมาเพื่อองค์กรทุกขนาด ใช้งานฟรี 100%
                    </p>

                    {/* Stats */}
                    <div className="mt-12 flex gap-12">
                        <div>
                            <p className="text-4xl font-bold text-white">5+</p>
                            <p className="text-sm text-slate-500">Room Types</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-white">∞</p>
                            <p className="text-sm text-slate-500">Bookings</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-[#00d9a5]">$0</p>
                            <p className="text-sm text-slate-500">Forever Free</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center p-6 sm:p-12 relative">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #00d9a5 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }} />
                </div>
                
                <div className="w-full max-w-md relative z-10">
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
                            <Image src="/favicon.ico" alt="NISIO Logo" width={48} height={48} className="object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">NISIO</h2>
                            <p className="text-xs text-slate-400">Room Booking System</p>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
