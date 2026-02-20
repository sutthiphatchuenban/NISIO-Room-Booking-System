'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useBookings(params?: {
    page?: number;
    limit?: number;
    status?: string[];
    roomId?: string;
    from?: string;
    to?: string;
    view?: string;
}) {
    return useQuery({
        queryKey: ['bookings', params],
        queryFn: async () => {
            const res = await api.bookings.list(params);
            return { data: res.data ?? [], meta: res.meta };
        },
    });
}

export function useBooking(id: string) {
    return useQuery({
        queryKey: ['bookings', id],
        queryFn: async () => {
            const res = await api.bookings.get(id);
            return res.data ?? null;
        },
        enabled: !!id,
    });
}

export function useMyBookings(params?: { page?: number; limit?: number; status?: string[] }) {
    return useQuery({
        queryKey: ['bookings', 'my', params],
        queryFn: async () => {
            const res = await api.bookings.my(params);
            return { data: res.data ?? [], meta: res.meta };
        },
    });
}

export function useUpcomingBookings() {
    return useQuery({
        queryKey: ['bookings', 'upcoming'],
        queryFn: async () => {
            const res = await api.bookings.upcoming();
            return res.data ?? [];
        },
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            roomId: string;
            title: string;
            description?: string;
            startTime: string;
            endTime: string;
            recurrence?: { type: string; endDate?: string };
        }) => api.bookings.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            // Invalidate calendar data to refresh after booking creation
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
        },
    });
}

export function useUpdateBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
            api.bookings.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            api.bookings.cancel(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, qrCode }: { id: string; qrCode?: string }) =>
            api.bookings.checkIn(id, qrCode),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}
