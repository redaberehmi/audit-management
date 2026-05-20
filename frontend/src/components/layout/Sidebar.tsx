'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard, ClipboardList, FileText, CheckSquare,
  Users, BarChart3, Settings, Shield, FolderOpen, Bell,
  BookOpen, ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['ALL'] },
  { href: '/missions', icon: ClipboardList, label: 'Missions d\'audit', roles: ['ADMIN', 'AUDIT_MANAGER', 'AUDITOR'] },
  { href: '/recommendations', icon: FileText, label: 'Recommandations', roles: ['ALL'] },
  { href: '/action-plans', icon: CheckSquare, label: 'Plans d\'actions', roles: ['ALL'] },
  { href: '/documents', icon: FolderOpen, label: 'Documents', roles: ['ALL'] },
  { href: '/reports', icon: BarChart3, label: 'Rapports', roles: ['ADMIN', 'AUDIT_MANAGER', 'DG'] },
  { href: '/users', icon: Users, label: 'Utilisateurs', roles: ['ADMIN'] },
  { href: '/audit-logs', icon: BookOpen, label: 'Journal d\'audit', roles: ['ADMIN', 'AUDIT_MANAGER'] },
  { href: '/settings', icon: Settings, label: 'Paramètres', roles: ['ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const visibleItems = navItems.filter(
    (item) => item.roles.includes('ALL') || item.roles.includes(user?.role || ''),
  );

  return (
    <aside className="w-64 bg-[#1e3a5f] flex flex-col h-full shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Audit</h1>
            <p className="text-white/50 text-xs">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-white/50 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
