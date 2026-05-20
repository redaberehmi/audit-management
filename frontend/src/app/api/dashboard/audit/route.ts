import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      kpis: {
        totalMissions: 14,
        activeMissions: 5,
        pendingValidations: 8,
        overdueRecs: 23,
        totalRecs: 124,
        myActionPlans: 6,
      },
      recentMissions: [
        {
          id: 'm1', reference: 'MISS-2024-001', title: 'Audit des processus financiers 2024',
          status: 'COMPLETED', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          auditors: [{ user: { firstName: 'Fatima', lastName: 'Zahra' } }],
          _count: { recommendations: 18 },
        },
        {
          id: 'm2', reference: 'MISS-2024-002', title: 'Audit des systèmes d\'information',
          status: 'IN_PROGRESS', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          auditors: [{ user: { firstName: 'Ahmed', lastName: 'Benali' } }],
          _count: { recommendations: 12 },
        },
        {
          id: 'm3', reference: 'MISS-2024-003', title: 'Audit de la gestion des ressources humaines',
          status: 'PLANNED', updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          auditors: [{ user: { firstName: 'Fatima', lastName: 'Zahra' } }, { user: { firstName: 'Ahmed', lastName: 'Benali' } }],
          _count: { recommendations: 0 },
        },
        {
          id: 'm4', reference: 'MISS-2025-001', title: 'Audit opérationnel direction commerciale',
          status: 'DRAFT', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          auditors: [{ user: { firstName: 'Fatima', lastName: 'Zahra' } }],
          _count: { recommendations: 0 },
        },
      ],
    },
    timestamp: new Date().toISOString(),
  });
}
