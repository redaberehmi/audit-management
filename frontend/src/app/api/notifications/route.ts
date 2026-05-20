import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      items: [
        {
          id: 'n1', type: 'OVERDUE', title: 'Recommandation en retard',
          message: 'La recommandation REC-2024-002 est en retard depuis 30 jours. Merci de mettre à jour votre plan d\'action.',
          isRead: false, isSent: true, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          recommendation: { reference: 'REC-2024-002', status: 'OVERDUE' },
        },
        {
          id: 'n2', type: 'VALIDATION_REQUEST', title: 'Validation requise',
          message: 'Le plan d\'action de REC-2024-005 est en attente de votre validation.',
          isRead: false, isSent: true, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          recommendation: { reference: 'REC-2024-005', status: 'PENDING_VALIDATION' },
        },
        {
          id: 'n3', type: 'DEADLINE_REMINDER', title: 'Rappel d\'échéance',
          message: 'La recommandation REC-2024-001 arrive à échéance dans 3 jours.',
          isRead: true, isSent: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          recommendation: { reference: 'REC-2024-001', status: 'IN_PROGRESS' },
        },
        {
          id: 'n4', type: 'STATUS_CHANGE', title: 'Statut modifié',
          message: 'La recommandation REC-2024-006 a été clôturée avec succès.',
          isRead: true, isSent: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          recommendation: { reference: 'REC-2024-006', status: 'CLOSED' },
        },
        {
          id: 'n5', type: 'RELANCE', title: 'Relance automatique',
          message: 'Sans réponse depuis 15 jours sur REC-2024-002. Escalade en cours vers la hiérarchie.',
          isRead: false, isSent: true, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          recommendation: { reference: 'REC-2024-002', status: 'OVERDUE' },
        },
      ],
      unreadCount: 3,
      pagination: { page: 1, limit: 20, total: 5 },
    },
    timestamp: new Date().toISOString(),
  });
}
