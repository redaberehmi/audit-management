import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      kpis: {
        total: 124,
        open: 87,
        overdue: 23,
        critical: 11,
        closed: 37,
        inProgress: 41,
        tauxCloture: 30,
        tauxRetard: 26,
      },
      charts: {
        byStatus: [
          { status: 'OPEN', count: 24 },
          { status: 'IN_PROGRESS', count: 41 },
          { status: 'OVERDUE', count: 23 },
          { status: 'COMPLETED', count: 15 },
          { status: 'PENDING_VALIDATION', count: 9 },
          { status: 'CLOSED', count: 37 },
          { status: 'DEFERRED', count: 7 },
          { status: 'DRAFT', count: 5 },
        ],
        byCriticality: [
          { criticality: 'LOW', count: 18 },
          { criticality: 'MEDIUM', count: 52 },
          { criticality: 'HIGH', count: 43 },
          { criticality: 'CRITICAL', count: 11 },
        ],
        byDirection: [
          { directionId: 'd1', name: 'Direction Financière', count: 32 },
          { directionId: 'd2', name: 'Direction RH', count: 18 },
          { directionId: 'd3', name: 'Direction SI', count: 28 },
          { directionId: 'd4', name: 'Direction Opérations', count: 25 },
          { directionId: 'd5', name: 'Direction Commerciale', count: 21 },
        ],
        monthlyEvolution: [
          { month: 1, label: 'Jan', created: 8, closed: 3 },
          { month: 2, label: 'Fév', created: 12, closed: 5 },
          { month: 3, label: 'Mar', created: 10, closed: 7 },
          { month: 4, label: 'Avr', created: 15, closed: 6 },
          { month: 5, label: 'Mai', created: 9, closed: 8 },
          { month: 6, label: 'Jun', created: 11, closed: 4 },
          { month: 7, label: 'Jul', created: 7, closed: 5 },
          { month: 8, label: 'Aoû', created: 6, closed: 3 },
          { month: 9, label: 'Sep', created: 13, closed: 9 },
          { month: 10, label: 'Oct', created: 10, closed: 6 },
          { month: 11, label: 'Nov', created: 14, closed: 7 },
          { month: 12, label: 'Déc', created: 9, closed: 4 },
        ],
      },
      upcomingDeadlines: [
        {
          id: 'r1', reference: 'REC-2024-018', description: 'Mise en place du processus de rapprochement bancaire mensuel',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          direction: { name: 'Direction Financière' },
          responsible: { firstName: 'Karim', lastName: 'Mansouri' },
        },
        {
          id: 'r2', reference: 'REC-2024-031', description: 'Déploiement de la politique de gestion des mots de passe',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          direction: { name: 'Direction SI' },
          responsible: { firstName: 'Ahmed', lastName: 'Benali' },
        },
        {
          id: 'r3', reference: 'REC-2024-045', description: 'Archivage électronique des bulletins de paie',
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          direction: { name: 'Direction RH' },
          responsible: { firstName: 'Leila', lastName: 'Chraibi' },
        },
        {
          id: 'r4', reference: 'REC-2024-052', description: 'Révision de la procédure de contrôle des engagements',
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          direction: { name: 'Direction Financière' },
          responsible: { firstName: 'Omar', lastName: 'Idrissi' },
        },
      ],
      recentActivity: [],
    },
    timestamp: new Date().toISOString(),
  });
}
