'use client';

import { useState } from 'react';
import { useRooms } from '@/hooks/use-rooms';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    MapPin,
    Users,
    Building2,
    Monitor,
    Phone,
    PartyPopper,
    BookOpen,
    SlidersHorizontal,
    Sparkles,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const roomTypeLabels: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    meeting_room: { 
        label: 'ห้องประชุม', 
        icon: Building2, 
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    desk: { 
        label: 'โต๊ะทำงาน', 
        icon: Monitor, 
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950/50',
    },
    phone_booth: { 
        label: 'ห้องโทรศัพท์', 
        icon: Phone, 
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
    event_space: { 
        label: 'พื้นที่จัดงาน', 
        icon: PartyPopper, 
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
    quiet_room: { 
        label: 'ห้องเงียบ', 
        icon: BookOpen, 
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/50',
    },
};

export default function RoomsPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [capacityFilter, setCapacityFilter] = useState<string>('');
    const { data: roomsData, isLoading: isRoomsLoading } = useRooms();
    const rooms = roomsData?.data || [];

    const filteredRooms = rooms.filter((room: any) => {
        if (search && !room.name?.toLowerCase().includes(search.toLowerCase()) &&
            !room.location?.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        if (typeFilter && typeFilter !== 'all' && room.type !== typeFilter) return false;
        if (capacityFilter && room.capacity < parseInt(capacityFilter)) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        ห้องทั้งหมด
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        เลือกห้องที่ต้องการจอง
                    </p>
                </div>
                <Badge variant="secondary" className="w-fit">
                    {filteredRooms.length} ห้อง
                </Badge>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/30">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาห้อง..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-background border-0 shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[160px] bg-background border-0 shadow-sm">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="ประเภท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทุกประเภท</SelectItem>
                                    <SelectItem value="meeting_room">ห้องประชุม</SelectItem>
                                    <SelectItem value="desk">โต๊ะทำงาน</SelectItem>
                                    <SelectItem value="phone_booth">ห้องโทรศัพท์</SelectItem>
                                    <SelectItem value="event_space">พื้นที่จัดงาน</SelectItem>
                                    <SelectItem value="quiet_room">ห้องเงียบ</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                                <SelectTrigger className="w-[140px] bg-background border-0 shadow-sm">
                                    <Users className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="ความจุ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทุกขนาด</SelectItem>
                                    <SelectItem value="2">2+ คน</SelectItem>
                                    <SelectItem value="5">5+ คน</SelectItem>
                                    <SelectItem value="10">10+ คน</SelectItem>
                                    <SelectItem value="20">20+ คน</SelectItem>
                                    <SelectItem value="50">50+ คน</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Room Grid */}
            {isRoomsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="border-0 shadow-sm">
                            <CardContent className="p-5 space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredRooms.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                    {filteredRooms.map((room: any) => {
                        const typeInfo = roomTypeLabels[room.type] || roomTypeLabels.meeting_room;
                        const TypeIcon = typeInfo.icon;

                        return (
                            <Card
                                key={room.id}
                                className="group relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-card to-muted/30 card-hover"
                            >
                                {/* Color indicator */}
                                <div 
                                    className="absolute top-0 left-0 w-full h-1"
                                    style={{ backgroundColor: room.color || '#6366f1' }}
                                />
                                
                                <CardContent className="p-5 pt-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                                {room.name}
                                            </h3>
                                            {room.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                    {room.description}
                                                </p>
                                            )}
                                        </div>
                                        <div
                                            className="h-4 w-4 rounded-full ml-2 shrink-0 ring-2 ring-border"
                                            style={{ backgroundColor: room.color || '#6366f1' }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge variant="outline" className={`${typeInfo.bg} ${typeInfo.color} border-0 font-medium`}>
                                            <TypeIcon className="mr-1 h-3 w-3" />
                                            {typeInfo.label}
                                        </Badge>
                                        <Badge variant="outline" className="bg-muted/50 border-0 font-medium">
                                            <Users className="mr-1 h-3 w-3" />
                                            {room.capacity} คน
                                        </Badge>
                                        {room.location && (
                                            <Badge variant="outline" className="bg-muted/50 border-0 font-medium">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {room.location}
                                            </Badge>
                                        )}
                                        {room.floor && (
                                            <Badge variant="outline" className="bg-muted/50 border-0 font-medium">
                                                ชั้น {room.floor}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Amenities */}
                                    {room.amenities && room.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {room.amenities.slice(0, 3).map((a: string, i: number) => (
                                                <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                                                    {a}
                                                </span>
                                            ))}
                                            {room.amenities.length > 3 && (
                                                <span className="text-[11px] px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                                                    +{room.amenities.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <Button 
                                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 group" 
                                        size="sm" 
                                        asChild
                                    >
                                        <Link href={`/rooms/${room.id}`}>
                                            ดูรายละเอียด & จอง
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <Building2 className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium">ไม่พบห้อง</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น
                    </p>
                </div>
            )}
        </div>
    );
}
