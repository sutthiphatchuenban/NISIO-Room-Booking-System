import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  CheckCircle,
  Shield,
  ArrowRight,
  LayoutDashboard,
  Zap,
  Users,
  Clock,
  Sparkles,
  BarChart3,
  DoorOpen,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-[#00d9a5] text-[#0a0f1c] text-center py-2 text-sm font-medium">
        <span className="font-semibold">ระบบจองห้องประชุมฟรี 100%</span>
        <Link href="/register" className="underline hover:no-underline ml-2">เริ่มต้นใช้งาน →</Link>
      </div>

      {/* Navigation */}
      <header className="bg-[#0a0f1c] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
                  <Image src="/favicon.ico" alt="NISIO Logo" width={40} height={40} className="object-contain" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">NISIO</span>
                  <span className="text-xs text-slate-400 ml-1">Room Booking</span>
                </div>
              </Link>
              
              {/* Nav Links */}
              <div className="hidden md:flex items-center ml-10 space-x-6">
                <Link href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">
                  ฟีเจอร์
                </Link>
                <Link href="#platform" className="text-slate-400 hover:text-white text-sm transition-colors">
                  แพลตฟอร์ม
                </Link>
                <Link href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors">
                  ราคา
                </Link>
                <Link href="#docs" className="text-slate-400 hover:text-white text-sm transition-colors">
                  เอกสาร
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-slate-400 hover:text-white text-sm hidden sm:block">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register">
                <Button className="bg-[#00d9a5] hover:bg-[#00c795] text-[#0a0f1c] font-semibold px-4 py-2 text-sm transition">
                  สมัครใช้งาน
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#0a0f1c] relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-[#00d9a5]/10 blur-3xl" />
            <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-[#00d9a5]/5 blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="max-w-xl">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                  จองห้องประชุม
                  <br />
                  <span className="text-[#00d9a5]">ง่าย เร็ว สะดวก</span>
                </h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  ระบบจัดการห้องประชุมและโต๊ะทำงานแบบครบวงจร
                  ออกแบบมาเพื่อองค์กรทุกขนาด ใช้งานฟรี 100%
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register">
                    <Button className="bg-[#00d9a5] hover:bg-[#00c795] text-[#0a0f1c] font-semibold px-6 py-3 h-auto text-base transition">
                      เริ่มต้นใช้งานฟรี
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" className="border-slate-600 hover:border-slate-500 text-white bg-transparent hover:bg-slate-800 px-6 py-3 h-auto text-base transition">
                      ดูฟีเจอร์
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="relative flex justify-center lg:justify-end">
                <svg className="w-full max-w-lg" viewBox="0 0 400 350" fill="none">
                  {/* Room booking illustration */}
                  <rect x="50" y="80" width="300" height="200" rx="8" stroke="#00d9a5" strokeWidth="2" fill="none"/>
                  <rect x="70" y="100" width="260" height="30" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none" opacity="0.5"/>
                  <line x1="80" y1="115" x2="200" y2="115" stroke="#00d9a5" strokeWidth="1.5" opacity="0.6"/>
                  
                  {/* Calendar grid */}
                  <rect x="70" y="150" width="120" height="110" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none" opacity="0.3"/>
                  <line x1="70" y1="170" x2="190" y2="170" stroke="#00d9a5" strokeWidth="1" opacity="0.3"/>
                  <line x1="100" y1="150" x2="100" y2="260" stroke="#00d9a5" strokeWidth="1" opacity="0.3"/>
                  <line x1="130" y1="150" x2="130" y2="260" stroke="#00d9a5" strokeWidth="1" opacity="0.3"/>
                  <line x1="160" y1="150" x2="160" y2="260" stroke="#00d9a5" strokeWidth="1" opacity="0.3"/>
                  
                  {/* Booking slots */}
                  <rect x="103" y="190" width="24" height="20" rx="2" fill="#00d9a5" opacity="0.6"/>
                  <rect x="133" y="215" width="24" height="20" rx="2" fill="#00d9a5" opacity="0.6"/>
                  <rect x="163" y="173" width="24" height="20" rx="2" fill="#00d9a5" opacity="0.6"/>
                  
                  {/* Room list */}
                  <rect x="210" y="150" width="120" height="30" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none" opacity="0.5"/>
                  <rect x="210" y="190" width="120" height="30" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none" opacity="0.5"/>
                  <rect x="210" y="230" width="120" height="30" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none" opacity="0.5"/>
                  
                  {/* Checkmarks */}
                  <circle cx="310" cy="165" r="8" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                  <path d="M306 165 L309 168 L314 162" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                  
                  {/* Floating elements */}
                  <ellipse cx="350" cy="60" rx="30" ry="15" stroke="#94a3b8" strokeWidth="1.5" fill="none"/>
                  <ellipse cx="50" cy="300" rx="25" ry="12" stroke="#94a3b8" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud - Marquee */}
        <section className="bg-white py-12 border-b border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-slate-500 text-sm mb-8">เหมาะสำหรับองค์กรทุกขนาด</p>
          </div>
          <div className="relative">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
            
            {/* Marquee container */}
            <div className="flex overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                <span className="text-lg font-semibold text-slate-400 mx-8">Startup</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">SME</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Enterprise</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Agency</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Co-working</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">School</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Hospital</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Government</span>
                {/* Duplicate for seamless loop */}
                <span className="text-lg font-semibold text-slate-400 mx-8">Startup</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">SME</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Enterprise</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Agency</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Co-working</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">School</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Hospital</span>
                <span className="text-lg font-semibold text-slate-400 mx-8">Government</span>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section id="platform" className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <p className="text-[#00d9a5] text-sm font-semibold mb-3">PLATFORM</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                ทุกอย่างที่คุณต้องการ
                <br />
                ในที่เดียว
              </h2>
              <p className="text-slate-600 text-lg">
                ตั้งแต่การจองครั้งแรก จนถึงการจัดการระดับองค์กร NISIO ช่วยให้คุณจัดการพื้นที่ได้อย่างมีประสิทธิภาพ
              </p>
            </div>

            {/* Cards Grid - Netlify style */}
            <div className="space-y-6">
              {/* Card 1: จองง่าย */}
              <div className="rounded-2xl p-8 lg:p-12" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="order-2 lg:order-1">
                    <svg className="w-full max-w-md mx-auto" viewBox="0 0 300 200" fill="none">
                      <rect x="20" y="20" width="260" height="160" rx="8" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <circle cx="40" cy="35" r="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <circle cx="55" cy="35" r="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <line x1="60" y1="60" x2="180" y2="60" stroke="#00d9a5" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="60" y1="75" x2="200" y2="75" stroke="#00d9a5" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="60" y1="90" x2="160" y2="90" stroke="#00d9a5" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="60" y1="105" x2="140" y2="105" stroke="#00d9a5" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="60" y1="120" x2="170" y2="120" stroke="#00d9a5" strokeWidth="1.5" opacity="0.6"/>
                      <line x1="60" y1="135" x2="150" y2="135" stroke="#00d9a5" strokeWidth="1.5" opacity="0.6"/>
                      <text x="40" y="65" fill="#00d9a5" fontFamily="monospace" fontSize="12">{'</>'}</text>
                      <rect x="200" y="50" width="60" height="30" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <rect x="220" y="100" width="50" height="25" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <circle cx="80" cy="165" r="12" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <path d="M74 165 L78 169 L86 161" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <div className="order-1 lg:order-2">
                    <h3 className="text-2xl font-bold text-white mb-4">จองง่าย ไม่ยุ่งยาก</h3>
                    <p className="text-slate-400 mb-6">
                      เลือกห้อง เลือกเวลา จองเสร็จภายในไม่กี่คลิก ระบบจะตรวจสอบความว่างให้อัตโนมัติ
                    </p>
                    <div className="space-y-3">
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        ปฏิทินแบบ Real-time
                      </div>
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        ระบบตรวจสอบความขัดแย้งอัตโนมัติ
                      </div>
                    </div>
                    <Link href="/register" className="inline-flex items-center gap-1 text-[#00d9a5] hover:text-[#00f5b8] mt-6 text-sm font-medium">
                      ลองใช้งาน <span className="text-xs">↗</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 2: จัดการห้อง */}
              <div className="rounded-2xl p-8 lg:p-12" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">จัดการห้องครบวงจร</h3>
                    <p className="text-slate-400 mb-6">
                      ตั้งค่าห้องประชุมทุกประเภท กำหนดกฎการจอง และจัดการอุปกรณ์ในห้องได้อย่างง่ายดาย
                    </p>
                    <div className="space-y-3">
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        รองรับหลายประเภทห้อง
                      </div>
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        ตั้งค่ากฎการจองได้ยืดหยุ่น
                      </div>
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        จัดการอุปกรณ์ในห้อง
                      </div>
                    </div>
                    <Link href="/register" className="inline-flex items-center gap-1 text-[#00d9a5] hover:text-[#00f5b8] mt-6 text-sm font-medium">
                      ดูรายละเอียด <span className="text-xs">↗</span>
                    </Link>
                  </div>
                  <div>
                    <svg className="w-full max-w-md mx-auto" viewBox="0 0 300 200" fill="none">
                      <rect x="80" y="40" width="140" height="120" rx="8" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <rect x="110" y="20" width="80" height="30" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <line x1="150" y1="50" x2="150" y2="40" stroke="#00d9a5" strokeWidth="1"/>
                      <rect x="20" y="80" width="50" height="40" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <line x1="70" y1="100" x2="80" y2="100" stroke="#00d9a5" strokeWidth="1"/>
                      <polyline points="100,120 120,100 140,110 160,90 180,95 200,80" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <rect x="230" y="60" width="50" height="35" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <line x1="220" y1="77" x2="230" y2="77" stroke="#00d9a5" strokeWidth="1"/>
                      <rect x="120" y="170" width="60" height="25" rx="4" stroke="#00d9a5" strokeWidth="1" fill="none"/>
                      <line x1="150" y1="160" x2="150" y2="170" stroke="#00d9a5" strokeWidth="1"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 3: ระบบอนุมัติ */}
              <div className="rounded-2xl p-8 lg:p-12" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="order-2 lg:order-1">
                    <svg className="w-full max-w-md mx-auto" viewBox="0 0 300 200" fill="none">
                      <circle cx="100" cy="120" r="60" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <circle cx="100" cy="120" r="45" stroke="#00d9a5" strokeWidth="1" fill="none" opacity="0.5"/>
                      <line x1="60" y1="80" x2="70" y2="90" stroke="#00d9a5" strokeWidth="1"/>
                      <line x1="140" y1="80" x2="130" y2="90" stroke="#00d9a5" strokeWidth="1"/>
                      <line x1="100" y1="50" x2="100" y2="65" stroke="#00d9a5" strokeWidth="1"/>
                      <line x1="100" y1="120" x2="130" y2="90" stroke="#00d9a5" strokeWidth="2"/>
                      <circle cx="100" cy="120" r="6" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <circle cx="200" cy="100" r="50" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <line x1="200" y1="100" x2="230" y2="70" stroke="#00d9a5" strokeWidth="2"/>
                      <circle cx="200" cy="100" r="5" stroke="#00d9a5" strokeWidth="1.5" fill="none"/>
                      <ellipse cx="250" cy="60" rx="25" ry="12" stroke="#94a3b8" strokeWidth="1" fill="none"/>
                      <ellipse cx="50" cy="150" rx="20" ry="10" stroke="#94a3b8" strokeWidth="1" fill="none"/>
                    </svg>
                  </div>
                  <div className="order-1 lg:order-2">
                    <h3 className="text-2xl font-bold text-white mb-4">ระบบอนุมัติอัจฉริยะ</h3>
                    <p className="text-slate-400 mb-6">
                      ตั้งค่าการอนุมัติตามเงื่อนไขที่คุณกำหนด อนุมัติอัตโนมัติสำหรับการจองปกติ และส่งให้ผู้อนุมัติสำหรับกรณีพิเศษ
                    </p>
                    <div className="space-y-3">
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        Auto-approval ตามกฎที่ตั้งไว้
                      </div>
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        Workflow การอนุมัติที่ยืดหยุ่น
                      </div>
                      <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#00d9a5]" />
                        แจ้งเตือนผู้เกี่ยวข้องทันที
                      </div>
                    </div>
                    <Link href="/register" className="inline-flex items-center gap-1 text-[#00d9a5] hover:text-[#00f5b8] mt-6 text-sm font-medium">
                      เรียนรู้เพิ่มเติม <span className="text-xs">↗</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-[#00d9a5] text-sm font-semibold mb-3">FEATURES</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                ฟีเจอร์ครบครัน
              </h2>
              <p className="text-slate-600 text-lg">
                ทุกอย่างที่คุณต้องการในการบริหารจัดการพื้นที่ทำงาน
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={CalendarDays}
                title="ปฏิทิน Real-time"
                description="ดูตารางการจองแบบ Day/Week/Month view พร้อมอัปเดตแบบ Real-time"
              />
              <FeatureCard
                icon={Shield}
                title="ระบบอนุมัติ"
                description="Workflow การอนุมัติที่ปรับแต่งได้ รองรับทั้ง Auto-approval และ Manual approval"
              />
              <FeatureCard
                icon={LayoutDashboard}
                title="Dashboard ครบวงจร"
                description="ดูภาพรวมการใช้งาน สถิติ และจัดการทุกอย่างได้ในหน้าเดียว"
              />
              <FeatureCard
                icon={Zap}
                title="รวดเร็ว ทันใจ"
                description="ทำงานลื่นไหลด้วย Technology Stack ล่าสุด โหลดไวไม่สะดุด"
              />
              <FeatureCard
                icon={CheckCircle}
                title="Multi-tenant"
                description="รองรับหลายองค์กรในระบบเดียว แยกข้อมูลอย่างปลอดภัย"
              />
              <FeatureCard
                icon={Users}
                title="จัดการผู้ใช้"
                description="กำหนดสิทธิ์ผู้ใช้ได้หลายระดับ: User, Manager, Admin, Super Admin"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              เริ่มต้นใช้งาน NISIO วันนี้
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              ฟรี 100% ไม่มีค่าใช้จ่ายซ่อนเร้น ไม่จำกัดจำนวนผู้ใช้
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button className="bg-[#00d9a5] hover:bg-[#00c795] text-[#0a0f1c] font-semibold px-8 py-3 h-auto text-base">
                  สมัครใช้งานฟรี
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-3 h-auto text-base">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0f1c] border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-12">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
                  <Image src="/favicon.ico" alt="NISIO Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-xl font-bold text-white">NISIO</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs">
                ระบบจองห้องประชุมแบบ Open Source ฟรี 100% สำหรับองค์กรทุกขนาด
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <h4 className="text-white font-semibold mb-3">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#features" className="text-slate-400 hover:text-white transition">Features</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">Pricing</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">Docs</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">About</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">Blog</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">GitHub</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">Documentation</Link></li>
                  <li><Link href="#" className="text-slate-400 hover:text-white transition">Support</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 NISIO Room Booking System. Open Source under MIT License.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-500 hover:text-white text-sm transition">Privacy</Link>
              <Link href="#" className="text-slate-500 hover:text-white text-sm transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="group relative bg-white rounded-xl p-6 border border-slate-200 hover:border-[#00d9a5]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00d9a5]/5">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00d9a5]/10 to-[#00d9a5]/5 flex items-center justify-center mb-4 group-hover:from-[#00d9a5]/20 group-hover:to-[#00d9a5]/10 transition-all">
        <Icon className="h-6 w-6 text-[#00d9a5]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
