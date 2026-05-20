import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { id: 'd1', code: 'DIR-FIN', name: 'Direction Financière', isActive: true },
      { id: 'd2', code: 'DIR-RH', name: 'Direction Ressources Humaines', isActive: true },
      { id: 'd3', code: 'DIR-IT', name: 'Direction Systèmes d\'Information', isActive: true },
      { id: 'd4', code: 'DIR-OPS', name: 'Direction Opérations', isActive: true },
      { id: 'd5', code: 'DIR-COM', name: 'Direction Commerciale', isActive: true },
    ],
    timestamp: new Date().toISOString(),
  });
}
