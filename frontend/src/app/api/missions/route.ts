import { NextRequest, NextResponse } from 'next/server';

const MISSIONS = [
  {
    id: 'm1', reference: 'MISS-2024-001', title: 'Audit des processus financiers 2024',
    type: 'FINANCIAL', scope: 'Direction Financière - Processus comptables et budgétaires',
    objectives: 'Évaluer la conformité des processus financiers et identifier les zones de risque',
    startDate: '2024-01-15T00:00:00.000Z', endDate: '2024-03-31T00:00:00.000Z',
    status: 'COMPLETED', isArchived: false,
    auditors: [
      { id: 'a1', userId: 'u4', isLead: true, user: { id: 'u4', firstName: 'Ahmed', lastName: 'Benali', email: 'auditeur@audit.com' } },
      { id: 'a2', userId: 'u3', isLead: false, user: { id: 'u3', firstName: 'Fatima', lastName: 'Zahra', email: 'manager.audit@audit.com' } },
    ],
    _count: { recommendations: 18 },
    createdAt: '2024-01-10T00:00:00.000Z', updatedAt: '2024-04-02T00:00:00.000Z',
  },
  {
    id: 'm2', reference: 'MISS-2024-002', title: 'Audit des systèmes d\'information et cybersécurité',
    type: 'IT', scope: 'Direction SI - Infrastructure, sécurité et applications métier',
    objectives: 'Évaluer la sécurité des SI et la conformité aux bonnes pratiques ISO 27001',
    startDate: '2024-04-01T00:00:00.000Z', endDate: '2024-06-30T00:00:00.000Z',
    status: 'IN_PROGRESS', isArchived: false,
    auditors: [
      { id: 'a3', userId: 'u4', isLead: true, user: { id: 'u4', firstName: 'Ahmed', lastName: 'Benali', email: 'auditeur@audit.com' } },
    ],
    _count: { recommendations: 12 },
    createdAt: '2024-03-25T00:00:00.000Z', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm3', reference: 'MISS-2024-003', title: 'Audit de la gestion des ressources humaines',
    type: 'OPERATIONAL', scope: 'Direction RH - Recrutement, formation, paie et administration',
    objectives: 'Vérifier la conformité des procédures RH et identifier les axes d\'amélioration',
    startDate: '2024-09-01T00:00:00.000Z', endDate: '2024-11-30T00:00:00.000Z',
    status: 'PLANNED', isArchived: false,
    auditors: [
      { id: 'a4', userId: 'u3', isLead: true, user: { id: 'u3', firstName: 'Fatima', lastName: 'Zahra', email: 'manager.audit@audit.com' } },
      { id: 'a5', userId: 'u4', isLead: false, user: { id: 'u4', firstName: 'Ahmed', lastName: 'Benali', email: 'auditeur@audit.com' } },
    ],
    _count: { recommendations: 0 },
    createdAt: '2024-08-10T00:00:00.000Z', updatedAt: '2024-08-15T00:00:00.000Z',
  },
  {
    id: 'm4', reference: 'MISS-2025-001', title: 'Audit opérationnel direction commerciale',
    type: 'OPERATIONAL', scope: 'Direction Commerciale - Processus de vente et relation client',
    objectives: 'Évaluer l\'efficience des processus commerciaux et la gestion du portefeuille clients',
    startDate: '2025-01-15T00:00:00.000Z', endDate: '2025-03-31T00:00:00.000Z',
    status: 'DRAFT', isArchived: false,
    auditors: [
      { id: 'a6', userId: 'u3', isLead: true, user: { id: 'u3', firstName: 'Fatima', lastName: 'Zahra', email: 'manager.audit@audit.com' } },
    ],
    _count: { recommendations: 0 },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm5', reference: 'MISS-2023-004', title: 'Audit de conformité réglementaire 2023',
    type: 'REGULATORY', scope: 'Ensemble de l\'organisation - Conformité réglementaire',
    objectives: 'Vérifier la conformité aux obligations réglementaires sectorielles',
    startDate: '2023-10-01T00:00:00.000Z', endDate: '2023-12-31T00:00:00.000Z',
    status: 'ARCHIVED', isArchived: true,
    auditors: [
      { id: 'a7', userId: 'u3', isLead: true, user: { id: 'u3', firstName: 'Fatima', lastName: 'Zahra', email: 'manager.audit@audit.com' } },
    ],
    _count: { recommendations: 24 },
    createdAt: '2023-09-20T00:00:00.000Z', updatedAt: '2024-01-05T00:00:00.000Z',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  let filtered = MISSIONS.filter(m => !m.isArchived);
  if (status) filtered = filtered.filter(m => m.status === status);
  if (search) filtered = filtered.filter(m =>
    m.title.toLowerCase().includes(search) || m.reference.toLowerCase().includes(search)
  );

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    data: { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    timestamp: new Date().toISOString(),
  });
}
