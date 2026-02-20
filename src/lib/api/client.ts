import type { ApiResponse } from '@/types';

// ============================================
// Token Management
// ============================================

const TOKEN_KEY = 'nisio_access_token';
const REFRESH_TOKEN_KEY = 'nisio_refresh_token';

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

// ============================================
// API Client
// ============================================

const API_BASE = '/api';

interface FetchOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    params?: Record<string, string | number | boolean | string[] | undefined>;
}

async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        if (data.success && data.data?.tokens) {
            setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | string[] | undefined>): string {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined) return;
            if (Array.isArray(value)) {
                value.forEach((v) => url.searchParams.append(key, v));
            } else {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.pathname + url.search;
}

async function fetchApi<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const { body, params, headers: customHeaders, ...restOptions } = options;

    const url = buildUrl(endpoint, params);
    const token = getAccessToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((customHeaders as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
        ...restOptions,
        headers,
    };

    if (body !== undefined) {
        fetchOptions.body = JSON.stringify(body);
    }

    let res = await fetch(url, fetchOptions);

    // Auto-refresh token on 401
    if (res.status === 401 && token) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            const newToken = getAccessToken();
            headers['Authorization'] = `Bearer ${newToken}`;
            fetchOptions.headers = headers;
            res = await fetch(url, fetchOptions);
        }
    }

    const data: ApiResponse<T> = await res.json();

    if (!data.success && data.error) {
        // If ultimately unauthorized after retry, clear tokens
        if (res.status === 401) {
            clearTokens();
        }
        throw new Error(data.error.message || 'Request failed');
    }

    return data;
}

// ============================================
// API Methods
// ============================================

export const api = {
    // Generic methods
    get<T>(endpoint: string, params?: FetchOptions['params']) {
        return fetchApi<T>(endpoint, { method: 'GET', params });
    },

    post<T>(endpoint: string, body?: unknown) {
        return fetchApi<T>(endpoint, { method: 'POST', body });
    },

    patch<T>(endpoint: string, body?: unknown) {
        return fetchApi<T>(endpoint, { method: 'PATCH', body });
    },

    delete<T>(endpoint: string, body?: unknown) {
        return fetchApi<T>(endpoint, { method: 'DELETE', body });
    },

    // ---- Auth ----
    auth: {
        login(username: string, password: string, rememberMe = false) {
            return api.post<{ user: import('@/types').UserProfile; tokens: import('@/types').AuthTokens }>('/auth/login', {
                username,
                password,
                rememberMe,
            });
        },

        register(data: { username: string; password: string; name: string; tenantSlug?: string }) {
            return api.post<{ user: import('@/types').UserProfile; tokens: import('@/types').AuthTokens }>('/auth/register', data);
        },

        refresh() {
            const refreshToken = getRefreshToken();
            return api.post<{ tokens: import('@/types').AuthTokens }>('/auth/refresh', { refreshToken });
        },

        logout() {
            return api.post('/auth/logout');
        },
    },

    // ---- Users ----
    users: {
        me() {
            return api.get<import('@/types').UserProfile>('/users/me');
        },

        updateProfile(data: { name?: string; phone?: string; department?: string }) {
            return api.patch<import('@/types').UserProfile>('/users/me', data);
        },

        list(params?: { page?: number; limit?: number; search?: string; role?: string; department?: string }) {
            return api.get<import('@/types').UserProfile[]>('/users', params);
        },

        updateRole(id: string, role: string) {
            return api.patch<import('@/types').UserProfile>(`/users/${id}/role`, { role });
        },

        updateStatus(id: string, isActive: boolean) {
            return api.patch<import('@/types').UserProfile>(`/users/${id}/status`, { isActive });
        },
    },

    // ---- Rooms ----
    rooms: {
        list(params?: {
            page?: number;
            limit?: number;
            type?: string[];
            capacity?: number;
            location?: string;
            availableFrom?: string;
            availableTo?: string;
        }) {
            return api.get<import('@/types').Room[]>('/rooms', params as Record<string, string | number | boolean | string[] | undefined>);
        },

        get(id: string) {
            return api.get<import('@/types').Room>(`/rooms/${id}`);
        },

        create(data: Record<string, unknown>) {
            return api.post<import('@/types').Room>('/rooms', data);
        },

        update(id: string, data: Record<string, unknown>) {
            return api.patch<import('@/types').Room>(`/rooms/${id}`, data);
        },

        delete(id: string) {
            return api.delete(`/rooms/${id}`);
        },

        availability(id: string, from: string, to: string) {
            return api.get<import('@/types').RoomAvailability>(`/rooms/${id}/availability`, { from, to });
        },
    },

    // ---- Bookings ----
    bookings: {
        list(params?: {
            page?: number;
            limit?: number;
            status?: string[];
            roomId?: string;
            userId?: string;
            from?: string;
            to?: string;
            view?: string;
        }) {
            return api.get<import('@/types').Booking[]>('/bookings', params as Record<string, string | number | boolean | string[] | undefined>);
        },

        get(id: string) {
            return api.get<import('@/types').Booking>(`/bookings/${id}`);
        },

        create(data: {
            roomId: string;
            title: string;
            description?: string;
            startTime: string;
            endTime: string;
            recurrence?: { type: string; endDate?: string };
        }) {
            return api.post<import('@/types').Booking>('/bookings', data);
        },

        update(id: string, data: Record<string, unknown>) {
            return api.patch<import('@/types').Booking>(`/bookings/${id}`, data);
        },

        cancel(id: string, reason?: string) {
            return api.delete<import('@/types').Booking>(`/bookings/${id}`, { reason });
        },

        checkIn(id: string, qrCode?: string) {
            return api.post<import('@/types').Booking>(`/bookings/${id}/check-in`, { qrCode });
        },

        my(params?: { page?: number; limit?: number; status?: string[] }) {
            return api.get<import('@/types').Booking[]>('/bookings/my', params as Record<string, string | number | boolean | string[] | undefined>);
        },

        upcoming() {
            return api.get<import('@/types').Booking[]>('/bookings/upcoming');
        },
    },

    // ---- Approvals ----
    approvals: {
        pending() {
            return api.get<import('@/types').PendingApprovalItem[]>('/approvals/pending');
        },

        approve(bookingId: string, comment?: string) {
            return api.post(`/approvals/${bookingId}/approve`, { comment });
        },

        reject(bookingId: string, comment?: string) {
            return api.post(`/approvals/${bookingId}/reject`, { comment });
        },
    },

    // ---- Amenities ----
    amenities: {
        list() {
            return api.get<import('@/types').AmenityInfo[]>('/amenities');
        },

        create(data: { name: string; icon?: string; description?: string }) {
            return api.post<import('@/types').AmenityInfo>('/amenities', data);
        },

        update(id: string, data: Record<string, unknown>) {
            return api.patch<import('@/types').AmenityInfo>(`/amenities/${id}`, data);
        },

        delete(id: string) {
            return api.delete(`/amenities/${id}`);
        },
    },

    // ---- Dashboard ----
    dashboard: {
        stats() {
            return api.get<import('@/types').DashboardStats>('/dashboard/stats');
        },

        calendar(params?: { view?: string; date?: string; roomId?: string }) {
            return api.get<import('@/types').CalendarEvent[]>('/dashboard/calendar', params);
        },

        analytics(params?: { period?: string; from?: string; to?: string }) {
            return api.get<import('@/types').AnalyticsData>('/dashboard/analytics', params);
        },
    },

    // ---- Admin ----
    admin: {
        approvalStats() {
            return api.get<import('@/types').ApprovalStats>('/admin/approvals/stats');
        },

        approvalHistory(params?: { page?: number; limit?: number; from?: string; to?: string; status?: string[]; approverId?: string }) {
            return api.get<import('@/types').ApprovalHistoryItem[]>(
                '/admin/approvals/history',
                params as Record<string, string | number | boolean | string[] | undefined>
            );
        },
    },

    // ---- Settings ----
    settings: {
        autoApproval: {
            get() {
                return api.get<{ enabled: boolean; rules: import('@/types').ApprovalRule[] }>('/settings/auto-approval');
            },

            createRule(data: Record<string, unknown>) {
                return api.post<import('@/types').ApprovalRule>('/settings/auto-approval/rules', data);
            },

            updateRule(id: string, data: Record<string, unknown>) {
                return api.patch<import('@/types').ApprovalRule>(`/settings/auto-approval/rules/${id}`, data);
            },

            deleteRule(id: string) {
                return api.delete(`/settings/auto-approval/rules/${id}`);
            },

            test(data: { roomId: string; userId: string; duration: number; startTime: string }) {
                return api.post<import('@/types').AutoApprovalTestResult>('/settings/auto-approval/test', data);
            },
        },

        tenant: {
            get() {
                return api.get<import('@/types').TenantSettings>('/settings/tenant');
            },

            update(data: Record<string, unknown>) {
                return api.patch<import('@/types').TenantSettings>('/settings/tenant', data);
            },
        },
    },
};
