'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Eye, Calendar, Users, FileText } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/axios';

const TYPE_LABELS: Record<string, string> = {
  INTERNAL: 'Interne', EXTERNAL: 'Externe', REGULATORY: 'Réglementaire',
  OPERATIONAL: 'Opérationnel', FINANCIAL: 'Financier', IT: 'Systèmes d\'Information',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon', PLANNED: 'Planifiée', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée', ARCHIVED: 'Archivée',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
  PLANNED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  ARCHIVED: 'bg-gray-100 text-gray-400 border-gray-200',
};

const TYPE_COLORS: Record<string, string> = {
  FINANCIAL: 'bg-emerald-100 text-emerald-700',
  IT: 'bg-purple-100 text-purple-700',
  OPERATIONAL: 'bg-orange-100 text-orange-700',
  REGULATORY: 'bg-red-100 text-red-700',
  INTERNAL: 'bg-blue-100 text-blue-700',
  EXTERNAL: 'bg-indigo-100 text-indigo-700',
};

export default function MissionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['missions', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/missions?${params}`);
      return res.data.data;
    },
  });

  const missions = data?.items || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Missions d'audit</h1>
          <p className="text-sm text-gray-500">{data?.pagination?.total || 0} missions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition">
          <Plus size={16} /> Nouvelle mission
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher une mission..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <div className="flex gap-2">
          {['IN_PROGRESS', 'PLANNED', 'COMPLETED'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              className={cn('text-xs px-3 py-1.5 rounded-full border font-medium transition',
                statusFilter === s ? STATUS_COLORS[s] : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de missions */}
      {isLoading ? (
        <div className="flex justify-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {missions.map((mission: any) => (
            <div key={mission.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1e3a5f] font-mono">{mission.reference}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border', STATUS_COLORS[mission.status])}>
                      {STATUS_LABELS[mission.status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 leading-snug">{mission.title}</h3>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ml-2', TYPE_COLORS[mission.type])}>
                  {TYPE_LABELS[mission.type]}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{mission.scope}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(mission.startDate)} → {formatDate(mission.endDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{mission.auditors?.length} auditeur{mission.auditors?.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={12} />
                    <span>{mission._count?.recommendations} rec.</span>
                  </div>
                </div>
              </div>

              {/* Auditeurs */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <div className="flex -space-x-2">
                  {mission.auditors?.slice(0, 3).map((a: any, i: number) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-[#1e3a5f] border-2 border-white flex items-center justify-center" title={`${a.user.firstName} ${a.user.lastName}`}>
                      <span className="text-white text-[9px] font-bold">{a.user.firstName[0]}{a.user.lastName[0]}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {mission.auditors?.map((a: any) => `${a.user.firstName} ${a.user.lastName}${a.isLead ? ' ★' : ''}`).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && missions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucune mission trouvée</p>
        </div>
      )}
    </div>
  );
}
