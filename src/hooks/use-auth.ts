'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, setTokens, clearTokens, isAuthenticated } from '@/lib/api/client';
import type { UserProfile } from '@/types';

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch current user profile
    const {
        data: user,
        isLoading,
        error,
        refetch,
    } = useQuery<UserProfile | null>({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            if (!isAuthenticated()) return null;
            const res = await api.users.me();
            if (res.success && res.data) {
                return res.data;
            }
            // Token is invalid
            clearTokens();
            return null;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });

    const login = useCallback(
        async (username: string, password: string, rememberMe = false) => {
            const res = await api.auth.login(username, password, rememberMe);
            if (res.success && res.data) {
                setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
                queryClient.setQueryData(['auth', 'me'], res.data.user);
                router.push('/dashboard');
                return { success: true };
            }
            return {
                success: false,
                error: res.error?.message || 'Login failed',
            };
        },
        [queryClient, router]
    );

    const register = useCallback(
        async (data: { username: string; password: string; name: string; tenantSlug?: string }) => {
            const res = await api.auth.register(data);
            if (res.success && res.data) {
                // Register API doesn't return tokens, so auto-login after register
                const loginRes = await api.auth.login(data.username, data.password, false);
                if (loginRes.success && loginRes.data) {
                    setTokens(loginRes.data.tokens.accessToken, loginRes.data.tokens.refreshToken);
                    queryClient.setQueryData(['auth', 'me'], loginRes.data.user);
                    router.push('/dashboard');
                    return { success: true };
                }
                // If auto-login fails, redirect to login page
                router.push('/login');
                return { success: true };
            }
            return {
                success: false,
                error: res.error?.message || 'Registration failed',
            };
        },
        [queryClient, router]
    );

    const logout = useCallback(async () => {
        try {
            await api.auth.logout();
        } catch {
            // Ignore errors on logout
        }
        clearTokens();
        queryClient.clear();
        router.push('/login');
    }, [queryClient, router]);

    const updateProfile = useCallback(
        async (data: { name?: string; phone?: string; department?: string }) => {
            const res = await api.users.updateProfile(data);
            if (res.success && res.data) {
                queryClient.setQueryData(['auth', 'me'], res.data);
                return { success: true };
            }
            return {
                success: false,
                error: res.error?.message || 'Update failed',
            };
        },
        [queryClient]
    );

    return {
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
        updateProfile,
        refetch,
    };
}
