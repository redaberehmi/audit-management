import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      items: [
        { id: 'u1', email: 'admin@audit.com', firstName: 'Super', lastName: 'Administrateur', role: 'ADMIN', isActive: true, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 'u2', email: 'dg@audit.com', firstName: 'Mohammed', lastName: 'Al Fassi', role: 'DG', isActive: true, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 'u3', email: 'manager.audit@audit.com', firstName: 'Fatima', lastName: 'Zahra', role: 'AUDIT_MANAGER', isActive: true, createdAt: '2024-01-05T00:00:00.000Z' },
        { id: 'u4', email: 'auditeur@audit.com', firstName: 'Ahmed', lastName: 'Benali', role: 'AUDITOR', isActive: true, createdAt: '2024-01-10T00:00:00.000Z' },
        { id: 'u5', email: 'responsable.action@audit.com', firstName: 'Karim', lastName: 'Mansouri', role: 'ACTION_OWNER', isActive: true, createdAt: '2024-01-15T00:00:00.000Z' },
        { id: 'u6', email: 'leila@audit.com', firstName: 'Leila', lastName: 'Chraibi', role: 'ACTION_OWNER', isActive: true, createdAt: '2024-02-01T00:00:00.000Z' },
        { id: 'u7', email: 'omar@audit.com', firstName: 'Omar', lastName: 'Idrissi', role: 'ACTION_OWNER', isActive: false, createdAt: '2024-02-15T00:00:00.000Z' },
      ],
      pagination: { page: 1, limit: 20, total: 7, totalPages: 1 },
    },
    timestamp: new Date().toISOString(),
  });
}
