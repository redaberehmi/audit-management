import { NextRequest, NextResponse } from 'next/server';

const ACTION_PLANS = [
  {
    id: 'ap1', title: 'Mise en place du processus de rapprochement bancaire',
    description: 'Définir la procédure, former les équipes et implémenter des contrôles automatiques mensuels.',
    status: 'IN_PROGRESS', progress: 65, startDate: '2024-07-01T00:00:00.000Z',
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    recommendation: { id: 'r1', reference: 'REC-2024-001', description: 'Mettre en place un processus de rapprochement bancaire mensuel', criticality: 'HIGH' },
    owner: { id: 'u5', firstName: 'Karim', lastName: 'Mansouri', email: 'responsable.action@audit.com' },
    createdAt: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 'ap2', title: 'Déploiement de la politique de mots de passe',
    description: 'Configuration de l\'Active Directory, sensibilisation des utilisateurs et contrôle de conformité.',
    status: 'DRAFT', progress: 15, startDate: '2024-08-01T00:00:00.000Z',
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    recommendation: { id: 'r2', reference: 'REC-2024-002', description: 'Déployer une politique de gestion des mots de passe', criticality: 'CRITICAL' },
    owner: { id: 'u5', firstName: 'Karim', lastName: 'Mansouri', email: 'responsable.action@audit.com' },
    createdAt: '2024-08-01T00:00:00.000Z',
  },
  {
    id: 'ap3', title: 'Archivage électronique des bulletins de paie',
    description: 'Sélection d\'un prestataire GED, migration des archives et mise en place des accès sécurisés.',
    status: 'APPROVED', progress: 40, startDate: '2024-09-01T00:00:00.000Z',
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    recommendation: { id: 'r3', reference: 'REC-2024-003', description: 'Système d\'archivage électronique des bulletins de paie', criticality: 'MEDIUM' },
    owner: { id: 'u5', firstName: 'Leila', lastName: 'Chraibi', email: 'leila@audit.com' },
    createdAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: 'ap4', title: 'Révision des procédures d\'appel d\'offres',
    description: 'Mise à jour des templates, formation des acheteurs et création d\'un outil de contrôle de conformité.',
    status: 'COMPLETED', progress: 100, startDate: '2024-03-01T00:00:00.000Z',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    recommendation: { id: 'r5', reference: 'REC-2024-005', description: 'Réviser les procédures d\'appel d\'offres', criticality: 'CRITICAL' },
    owner: { id: 'u5', firstName: 'Omar', lastName: 'Idrissi', email: 'omar@audit.com' },
    createdAt: '2024-03-01T00:00:00.000Z',
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const total = ACTION_PLANS.length;
  const items = ACTION_PLANS.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    data: { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    timestamp: new Date().toISOString(),
  });
}
