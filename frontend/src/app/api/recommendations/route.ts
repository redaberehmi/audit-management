import { NextRequest, NextResponse } from 'next/server';

const RECOMMENDATIONS = [
  {
    id: 'r1', reference: 'REC-2024-001', source: 'Audit Interne',
    constat: 'Les rapprochements bancaires ne sont pas effectués mensuellement, exposant l\'organisation à des risques de fraude.',
    description: 'Mettre en place un processus de rapprochement bancaire mensuel avec validation hiérarchique obligatoire.',
    risk: 'Risque de fraude et d\'erreurs comptables non détectées',
    criticality: 'HIGH', status: 'IN_PROGRESS', progress: 65,
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd1', name: 'Direction Financière', code: 'DIR-FIN' },
    responsible: { id: 'u5', firstName: 'Karim', lastName: 'Mansouri', email: 'responsable.action@audit.com' },
    validator: { id: 'u3', firstName: 'Fatima', lastName: 'Zahra', email: 'manager.audit@audit.com' },
    mission: { id: 'm1', reference: 'MISS-2024-001', title: 'Audit des processus financiers 2024', type: 'FINANCIAL' },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r2', reference: 'REC-2024-002', source: 'Audit Interne',
    constat: 'Absence totale de politique de gestion des mots de passe. Les utilisateurs utilisent des mots de passe faibles.',
    description: 'Déployer une politique de gestion des mots de passe conforme aux normes de sécurité ISO 27001.',
    risk: 'Risque critique de compromission des accès systèmes et données sensibles',
    criticality: 'CRITICAL', status: 'OVERDUE', progress: 20,
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd3', name: 'Direction SI', code: 'DIR-IT' },
    responsible: { id: 'u5', firstName: 'Karim', lastName: 'Mansouri', email: 'responsable.action@audit.com' },
    mission: { id: 'm2', reference: 'MISS-2024-002', title: 'Audit des systèmes d\'information', type: 'IT' },
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r3', reference: 'REC-2024-003', source: 'Commissaire aux Comptes',
    constat: 'Les fiches de paie ne sont pas archivées conformément aux obligations légales (5 ans).',
    description: 'Mettre en place un système d\'archivage électronique sécurisé et conforme des bulletins de paie.',
    risk: 'Risque de non-conformité réglementaire et sanctions potentielles',
    criticality: 'MEDIUM', status: 'PLAN_TO_VALIDATE', progress: 40,
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd2', name: 'Direction RH', code: 'DIR-RH' },
    responsible: { id: 'u5', firstName: 'Leila', lastName: 'Chraibi', email: 'leila@audit.com' },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r4', reference: 'REC-2024-004', source: 'Audit Interne',
    constat: 'Le plan de continuité d\'activité (PCA) n\'a pas été testé depuis plus de 2 ans.',
    description: 'Organiser un exercice de simulation annuel du PCA avec retour d\'expérience documenté.',
    risk: 'Risque d\'incapacité à reprendre l\'activité en cas de sinistre majeur',
    criticality: 'HIGH', status: 'OPEN', progress: 0,
    dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd3', name: 'Direction SI', code: 'DIR-IT' },
    responsible: { id: 'u5', firstName: 'Karim', lastName: 'Mansouri', email: 'responsable.action@audit.com' },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r5', reference: 'REC-2024-005', source: 'Audit Externe',
    constat: 'Les procédures d\'appel d\'offres ne respectent pas systématiquement le Code des Marchés Publics.',
    description: 'Réviser et formaliser les procédures d\'appel d\'offres en conformité avec la réglementation.',
    risk: 'Risque de contentieux juridique et de perte de crédibilité institutionnelle',
    criticality: 'CRITICAL', status: 'PENDING_VALIDATION', progress: 90,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd4', name: 'Direction Opérations', code: 'DIR-OPS' },
    responsible: { id: 'u5', firstName: 'Omar', lastName: 'Idrissi', email: 'omar@audit.com' },
    validator: { id: 'u3', firstName: 'Fatima', lastName: 'Zahra', email: 'manager.audit@audit.com' },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r6', reference: 'REC-2024-006', source: 'Audit Interne',
    constat: 'Absence de procédure formalisée de gestion des accès logiques pour les départs/mutations.',
    description: 'Mettre en place une procédure de révocation des accès dans les 24h suivant un départ ou mutation.',
    risk: 'Risque d\'accès non autorisé aux systèmes d\'information par d\'anciens employés',
    criticality: 'HIGH', status: 'CLOSED', progress: 100,
    dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd3', name: 'Direction SI', code: 'DIR-IT' },
    responsible: { id: 'u5', firstName: 'Karim', lastName: 'Mansouri', email: 'responsable.action@audit.com' },
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r7', reference: 'REC-2024-007', source: 'Audit Interne',
    constat: 'Les tableaux de bord de pilotage de la performance commerciale sont établis manuellement sous Excel.',
    description: 'Automatiser la production des tableaux de bord commerciaux via un outil BI centralisé.',
    risk: 'Risque d\'erreurs, de délais et de prise de décision sur données non fiables',
    criticality: 'MEDIUM', status: 'DRAFT', progress: 0,
    dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd5', name: 'Direction Commerciale', code: 'DIR-COM' },
    responsible: { id: 'u5', firstName: 'Sara', lastName: 'Bennani', email: 'sara@audit.com' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r8', reference: 'REC-2025-001', source: 'Audit Externe',
    constat: 'Le processus de consolidation des états financiers est réalisé sans contrôle de cohérence automatique.',
    description: 'Implémenter des contrôles automatiques de cohérence dans le processus de consolidation.',
    risk: 'Risque d\'erreurs significatives dans les états financiers consolidés',
    criticality: 'HIGH', status: 'IN_PROGRESS', progress: 50,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    direction: { id: 'd1', name: 'Direction Financière', code: 'DIR-FIN' },
    responsible: { id: 'u5', firstName: 'Karim', lastName: 'Mansouri', email: 'responsable.action@audit.com' },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search')?.toLowerCase();
  const status = searchParams.get('status');
  const criticality = searchParams.get('criticality');

  let filtered = [...RECOMMENDATIONS];
  if (search) {
    filtered = filtered.filter(r =>
      r.reference.toLowerCase().includes(search) ||
      r.description.toLowerCase().includes(search) ||
      r.source.toLowerCase().includes(search)
    );
  }
  if (status) filtered = filtered.filter(r => r.status === status);
  if (criticality) filtered = filtered.filter(r => r.criticality === criticality);

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    success: true,
    data: {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
    timestamp: new Date().toISOString(),
  });
}
