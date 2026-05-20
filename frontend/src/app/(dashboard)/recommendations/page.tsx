'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recommendationsService, RecommendationFilter } from '@/services/recommendations.service';
import { Plus, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatDate, getStatusColor, getCriticalityColor, truncate } from '@/lib/utils';
import { STATUS_LABELS, CRITICALITY_LABELS, Recommendation } from '@/types';
import Link from 'next/link';

export default function RecommendationsPage() {
  const [filter, setFilter] = useState<RecommendationFilter>({ page: 1, limit: 20 });

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', filter],
    queryFn: () => recommendationsService.findAll(filter),
  });

  const handleSearch = (value: string) => {
    setFilter((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilter((prev) => ({ ...prev, status: status || undefined, page: 1 }));
  };

  const handleExport = () => recommendationsService.exportExcel(filter);

  const items: Recommendation[] = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recommandations</h1>
          <p className="text-sm text-gray-500">
            {pagination?.total || 0} recommandation{pagination?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={16} />
            Exporter
          </button>
          <Link
            href="/recommendations/new"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition"
          >
            <Plus size={16} />
            Nouvelle
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, description..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFilter((prev) => ({ ...prev, criticality: e.target.value || undefined, page: 1 }))}
          >
            <option value="">Toutes criticités</option>
            {Object.entries(CRITICALITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Quick Status Filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {(['OVERDUE', 'IN_PROGRESS', 'PENDING_VALIDATION', 'OPEN'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(filter.status === status ? '' : status)}
              className={cn(
                'text-xs px-3 py-1 rounded-full border font-medium transition',
                filter.status === status
                  ? getStatusColor(status)
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50',
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Référence</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Criticité</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Avancement</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Direction</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Responsable</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Aucune recommandation trouvée
                  </td>
                </tr>
              ) : (
                items.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <Link href={`/recommendations/${rec.id}`} className="font-semibold text-[#1e3a5f] hover:underline whitespace-nowrap">
                        {rec.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 max-w-xs">{truncate(rec.description, 80)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', getCriticalityColor(rec.criticality))}>
                        {CRITICALITY_LABELS[rec.criticality]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium border', getStatusColor(rec.status))}>
                        {STATUS_LABELS[rec.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={cn('h-1.5 rounded-full', rec.progress >= 80 ? 'bg-green-500' : rec.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                            style={{ width: `${rec.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{rec.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {rec.direction?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {rec.responsible ? `${rec.responsible.firstName} ${rec.responsible.lastName}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium whitespace-nowrap', new Date(rec.dueDate) < new Date() && rec.status !== 'CLOSED' ? 'text-red-600' : 'text-gray-600')}>
                        {formatDate(rec.dueDate)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultats)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setFilter((p) => ({ ...p, page: p.page! - 1 }))}
                disabled={pagination.page === 1}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setFilter((p) => ({ ...p, page: p.page! + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
