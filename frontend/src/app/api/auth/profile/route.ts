import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      id: 'u1', email: 'admin@audit.com', firstName: 'Super', lastName: 'Administrateur',
      role: 'ADMIN', isActive: true,
    },
  });
}
