'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Room, RoomAvailability } from '@/types';

export function useRooms(params?: {
    page?: number;
    limit?: number;
    type?: string[];
    capacity?: number;
    location?: string;
}) {
    return useQuery({
        queryKey: ['rooms', params],
        queryFn: async () => {
            const res = await api.rooms.list(params);
            return {
                data: res.data ?? [],
                meta: res.meta,
            };
        },
    });
}

export function useRoom(id: string) {
    return useQuery({
        queryKey: ['rooms', id],
        queryFn: async () => {
            const res = await api.rooms.get(id);
            return res.data ?? null;
        },
        enabled: !!id,
    });
}

export function useRoomAvailability(id: string, from: string, to: string) {
    return useQuery<RoomAvailability | null>({
        queryKey: ['rooms', id, 'availability', from, to],
        queryFn: async () => {
            const res = await api.rooms.availability(id, from, to);
            return res.data ?? null;
        },
        enabled: !!id && !!from && !!to,
    });
}

export function useCreateRoom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Record<string, unknown>) => api.rooms.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
}

export function useUpdateRoom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
            api.rooms.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['rooms', variables.id] });
        },
    });
}

export function useDeleteRoom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.rooms.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
    });
}
