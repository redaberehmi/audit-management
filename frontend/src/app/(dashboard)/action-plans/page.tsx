'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import api from '@/lib/axios';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon', APPROVED: 'Approuvé', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé', CANCELLED: 'Annulé', DEFERRED: 'Reporté',
};
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600', APPROVED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700', DEFERRED: 'bg-orange-100 text-orange-700',
};
const CRITICALITY_COLORS: Record<string, string> = {
  LOW: 'border-l-green-400', MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-orange-500', CRITICAL: 'border-l-red-500',
};

export default function ActionPlansPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['action-plans'],
    queryFn: async () => { const res = await api.get('/action-plans'); return res.data.data; },
  });

  const plans = data?.items || [];
  const stats = {
    total: plans.length,
    inProgress: plans.filter((p: any) => p.status === 'IN_PROGRESS').length,
    overdue: plans.filter((p: any) => new Date(p.dueDate) < new Date() && p.status !== 'COMPLETED').length,
    completed: plans.filter((p: any) => p.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Plans d'actions</h1>
          <p className="text-sm text-gray-500">{plans.length} plans d'actions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition">
          <Plus size={16} /> Nouveau plan
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: CheckSquare, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'En cours', value: stats.inProgress, icon: TrendingUp, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'En retard', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Terminés', value: stats.completed, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((kpi) => (
          <div key={kpi.label} className={cn('rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3', kpi.bg)}>
            <kpi.icon className={cn('w-8 h-8', kpi.color)} />
            <div>
              <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {isLoading ? <div className="text-center py-8 text-gray-400">Chargement...</div> :
          plans.map((plan: any) => {
            const isOverdue = new Date(plan.dueDate) < new Date() && plan.status !== 'COMPLETED';
            return (
              <div key={plan.id} className={cn('bg-white rounded-xl border-l-4 border border-gray-100 p-5 shadow-sm hover:shadow-md transition', CRITICALITY_COLORS[plan.recommendation?.criticality] || 'border-l-gray-300')}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-[#1e3a5f] font-mono">{plan.recommendation?.reference}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[plan.status])}>
                        {STATUS_LABELS[plan.status]}
                      </span>
                      {isOverdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle size={10} /> En retard
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{plan.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{plan.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn('text-sm font-semibold', isOverdue ? 'text-red-600' : 'text-gray-700')}>
                      {formatDate(plan.dueDate)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {plan.owner?.firstName} {plan.owner?.lastName}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={cn('h-2 rounded-full transition-all', plan.progress >= 80 ? 'bg-green-500' : plan.progress >= 50 ? 'bg-yellow-500' : 'bg-red-400')}
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-10 text-right">{plan.progress}%</span>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
