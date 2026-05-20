'use client';

import { ClipboardList, AlertTriangle, CheckCircle2, Clock, FileText, Activity } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

function KPICard({ title, value, subtitle, icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', color)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}

const MISSION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon', PLANNED: 'Planifiée', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée', ARCHIVED: 'Archivée',
};

const MISSION_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

export function AuditDashboard({ data }: { data: any }) {
  if (!data) return null;

  const { kpis, recentMissions } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Audit</h1>
        <p className="text-sm text-gray-500 mt-1">Suivi des missions et recommandations</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Missions Actives"
          value={kpis?.activeMissions || 0}
          subtitle={`${kpis?.totalMissions || 0} au total`}
          color="text-blue-600"
          icon={<ClipboardList className="w-6 h-6 text-blue-600" />}
        />
        <KPICard
          title="En attente validation"
          value={kpis?.pendingValidations || 0}
          color="text-purple-600"
          icon={<Clock className="w-6 h-6 text-purple-600" />}
        />
        <KPICard
          title="Recommandations en retard"
          value={kpis?.overdueRecs || 0}
          color="text-red-600"
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        />
        <KPICard
          title="Total Recommandations"
          value={kpis?.totalRecs || 0}
          color="text-gray-700"
          icon={<FileText className="w-6 h-6 text-gray-600" />}
        />
        <KPICard
          title="Mes Plans d'Actions"
          value={kpis?.myActionPlans || 0}
          subtitle="En cours ou en attente"
          color="text-orange-600"
          icon={<Activity className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Recent Missions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Missions Récentes</h3>
          <Link href="/missions" className="text-xs text-blue-600 hover:underline">
            Voir tout
          </Link>
        </div>

        <div className="space-y-3">
          {recentMissions?.map((mission: any) => (
            <Link
              key={mission.id}
              href={`/missions/${mission.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1e3a5f]">{mission.reference}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', MISSION_STATUS_COLORS[mission.status])}>
                    {MISSION_STATUS_LABELS[mission.status]}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{mission.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {mission.auditors?.map((a: any) => `${a.user.firstName} ${a.user.lastName}`).join(', ')}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-xs font-medium text-gray-500">
                  {mission._count?.recommendations || 0} rec.
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(mission.updatedAt)}
                </p>
              </div>
            </Link>
          ))}

          {(!recentMissions || recentMissions.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">Aucune mission récente</p>
          )}
        </div>
      </div>
    </div>
  );
}
