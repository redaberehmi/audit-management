import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({
    success: true,
    data: {
      accessToken: `mock-jwt-token-refreshed-${Date.now()}`,
      refreshToken: `mock-refresh-token-new-${Date.now()}`,
    },
  });
}
