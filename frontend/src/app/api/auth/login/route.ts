import { NextRequest, NextResponse } from 'next/server';

const USERS: Record<string, any> = {
  'admin@audit.com': {
    id: 'u1', email: 'admin@audit.com', firstName: 'Super', lastName: 'Administrateur',
    role: 'ADMIN', isActive: true, password: 'Admin@1234',
  },
  'dg@audit.com': {
    id: 'u2', email: 'dg@audit.com', firstName: 'Mohammed', lastName: 'Al Fassi',
    role: 'DG', isActive: true, password: 'Admin@1234',
  },
  'manager.audit@audit.com': {
    id: 'u3', email: 'manager.audit@audit.com', firstName: 'Fatima', lastName: 'Zahra',
    role: 'AUDIT_MANAGER', isActive: true, password: 'Admin@1234',
  },
  'auditeur@audit.com': {
    id: 'u4', email: 'auditeur@audit.com', firstName: 'Ahmed', lastName: 'Benali',
    role: 'AUDITOR', isActive: true, password: 'Admin@1234',
  },
  'responsable.action@audit.com': {
    id: 'u5', email: 'responsable.action@audit.com', firstName: 'Karim', lastName: 'Mansouri',
    role: 'ACTION_OWNER', isActive: true, password: 'Admin@1234',
  },
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = USERS[email?.toLowerCase()];

  if (!user || user.password !== password) {
    return NextResponse.json({ success: false, message: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  const { password: _, ...userWithoutPass } = user;

  return NextResponse.json({
    success: true,
    data: {
      user: userWithoutPass,
      accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${user.id}`,
      expiresIn: '15m',
    },
  });
}
