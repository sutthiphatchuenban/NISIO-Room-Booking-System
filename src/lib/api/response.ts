import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Standard API response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Success response
export function successResponse<T>(data: T, meta?: { page: number; limit: number; total: number }): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

// Error response
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

// Common error responses
export const errors = {
  unauthorized: () => errorResponse('UNAUTHORIZED', 'Authentication required', 401),
  forbidden: (message?: string) => errorResponse('FORBIDDEN', message || 'Insufficient permissions', 403),
  notFound: (resource: string) => errorResponse('NOT_FOUND', `${resource} not found`, 404),
  validation: (zodError: ZodError) => {
    const details: Record<string, string[]> = {};
    zodError.issues.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(err.message);
    });
    return errorResponse('VALIDATION_ERROR', 'Invalid input data', 400, details);
  },
  conflict: (message: string) => errorResponse('CONFLICT', message, 409),
  internal: (message: string = 'Internal server error') => errorResponse('INTERNAL_ERROR', message, 500),
  rateLimited: () => errorResponse('RATE_LIMITED', 'Too many requests', 429),
};

// Pagination helper
export function createMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
  };
}