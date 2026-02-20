import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  // In a stateless JWT system, logout is handled client-side
  // by removing the token from storage
  return successResponse({ message: 'Logged out successfully' });
}