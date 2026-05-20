'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, Target } from 'lucide-react';
import { cn, formatDate, getStatusColor, getCriticalityColor } from '@/lib/utils';
import { STATUS_LABELS, CRITICALITY_LABELS } from '@/types';

const COLORS = {
  DRAFT: '#94a3b8',
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  OVERDUE: '#ef4444',
  COMPLETED: '#22c55e',
  CLOSED: '#64748b',
  DEFERRED: '#f97316',
  PENDING_VALIDATION: '#a855f7',
};

const CRITICALITY_COLORS = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; positive: boolean };
}

function KPICard({ title, value, subtitle, icon, color, trend }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn('text-3xl font-bold mt-1', color)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', `bg-${color.replace('text-', '')}/10`)}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
          {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend.value}% vs mois précédent
        </div>
      )}
    </div>
  );
}

export function DGDashboard({ data }: { data: any }) {
  if (!data) return null;

  const { kpis, charts, upcomingDeadlines } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord DG</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble des recommandations et plans d'actions</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          Mis à jour : {formatDate(new Date())}
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Recommandations"
          value={kpis?.total || 0}
          color="text-[#1e3a5f]"
          icon={<Target className="w-6 h-6 text-[#1e3a5f]" />}
        />
        <KPICard
          title="En Retard"
          value={kpis?.overdue || 0}
          subtitle={`${kpis?.tauxRetard || 0}% des ouvertes`}
          color="text-red-600"
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        />
        <KPICard
          title="Taux de Clôture"
          value={`${kpis?.tauxCloture || 0}%`}
          subtitle={`${kpis?.closed || 0} recommandations`}
          color="text-green-600"
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
        />
        <KPICard
          title="Critiques Actives"
          value={kpis?.critical || 0}
          color="text-orange-600"
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={charts?.byStatus?.map((s: any) => ({
                  name: STATUS_LABELS[s.status as keyof typeof STATUS_LABELS] || s.status,
                  value: s.count,
                  color: COLORS[s.status as keyof typeof COLORS] || '#94a3b8',
                }))}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                dataKey="value"
              >
                {charts?.byStatus?.map((entry: any, index: number) => (
                  <Cell key={index} fill={COLORS[entry.status as keyof typeof COLORS] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend iconSize={10} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Criticality */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition par Criticité</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts?.byCriticality?.map((c: any) => ({
              name: CRITICALITY_LABELS[c.criticality as keyof typeof CRITICALITY_LABELS] || c.criticality,
              count: c.count,
              fill: CRITICALITY_COLORS[c.criticality as keyof typeof CRITICALITY_COLORS],
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Recommandations" radius={[4, 4, 0, 0]}>
                {charts?.byCriticality?.map((entry: any, index: number) => (
                  <Cell key={index} fill={CRITICALITY_COLORS[entry.criticality as keyof typeof CRITICALITY_COLORS] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Direction */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Par Direction</h3>
          <div className="space-y-3">
            {charts?.byDirection?.slice(0, 6).map((d: any, i: number) => {
              const maxCount = Math.max(...(charts?.byDirection?.map((x: any) => x.count) || [1]));
              const pct = Math.round((d.count / maxCount) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium truncate max-w-[150px]">{d.name}</span>
                    <span className="text-gray-900 font-semibold ml-2">{d.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#1e3a5f] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Evolution */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Évolution Mensuelle</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={charts?.monthlyEvolution || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="created" name="Créées" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
            <Area type="monotone" dataKey="closed" name="Clôturées" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-700">Échéances dans les 30 prochains jours</h3>
          </div>
          <div className="space-y-2">
            {upcomingDeadlines.map((rec: any) => (
              <div key={rec.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div>
                  <span className="text-xs font-semibold text-[#1e3a5f]">{rec.reference}</span>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{rec.description}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-xs font-semibold text-orange-700">{formatDate(rec.dueDate)}</p>
                  <p className="text-xs text-gray-500">{rec.responsible?.firstName} {rec.responsible?.lastName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
