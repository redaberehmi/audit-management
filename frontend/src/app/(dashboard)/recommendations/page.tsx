'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn, formatDate, getStatusColor, getCriticalityColor, truncate } from '@/lib/utils';
import { STATUS_LABELS, CRITICALITY_LABELS } from '@/types';
import { Modal } from '@/components/ui/modal';
import { recommendationsService } from '@/services/recommendations.service';
import { referentialsService } from '@/services/referentials.service';
import { usersService } from '@/services/users.service';
import { missionsService } from '@/services/missions.service';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RecommendationsPage() {
  const [filter, setFilter] = useState({ page: 1, limit: 20 } as any);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', filter],
    queryFn: () => recommendationsService.findAll(filter),
  });

  const { data: directions } = useQuery({
    queryKey: ['directions'],
    queryFn: () => referentialsService.getDirections(),
    enabled: showModal,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => usersService.findAll({ limit: 100 }),
    enabled: showModal,
  });

  const { data: missionsData } = useQuery({
    queryKey: ['missions-list'],
    queryFn: () => missionsService.findAll({ limit: 100 }),
    enabled: showModal,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerStatus, handleSubmit: handleStatusSubmit, reset: resetStatus } = useForm();

  const createRec = useMutation({
    mutationFn: (data: any) => recommendationsService.create(data),
    onSuccess: () => {
      toast({ title: 'Recommandation créée ✅' });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      setShowModal(false);
      reset();
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.response?.data?.message, variant: 'destructive' }),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status, comment, progress }: any) =>
      recommendationsService.changeStatus(id, status, comment, progress),
    onSuccess: () => {
      toast({ title: 'Statut mis à jour ✅' });
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      setShowStatusModal(null);
      resetStatus();
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.response?.data?.message, variant: 'destructive' }),
  });

  const items = data?.items || [];
  const pagination = data?.pagination;
  const actionOwners = (usersData?.items || []).filter((u: any) =>
    ['ACTION_OWNER', 'AUDIT_MANAGER', 'AUDITOR'].includes(u.role)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recommandations</h1>
          <p className="text-sm text-gray-500">{pagination?.total || 0} recommandation{(pagination?.total || 0) !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => recommendationsService.exportExcel(filter)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Download size={16} /> Exporter
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition">
            <Plus size={16} /> Nouvelle
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher par référence, description..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => setFilter((p: any) => ({ ...p, search: e.target.value || undefined, page: 1 }))} />
          </div>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => setFilter((p: any) => ({ ...p, status: e.target.value || undefined, page: 1 }))}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => setFilter((p: any) => ({ ...p, criticality: e.target.value || undefined, page: 1 }))}>
            <option value="">Toutes criticités</option>
            {Object.entries(CRITICALITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {(['OVERDUE', 'IN_PROGRESS', 'PENDING_VALIDATION', 'OPEN'] as const).map(s => (
            <button key={s} onClick={() => setFilter((p: any) => ({ ...p, status: p.status === s ? undefined : s, page: 1 }))}
              className={cn('text-xs px-3 py-1 rounded-full border font-medium transition',
                filter.status === s ? getStatusColor(s) : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
              {STATUS_LABELS[s]}
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Aucune recommandation trouvée</td></tr>
              ) : items.map((rec: any) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1e3a5f] whitespace-nowrap">{rec.reference}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 max-w-xs">{truncate(rec.description, 75)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium', getCriticalityColor(rec.criticality))}>
                      {CRITICALITY_LABELS[rec.criticality]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setShowStatusModal(rec)}
                      className={cn('inline-flex px-2 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition', getStatusColor(rec.status))}>
                      {STATUS_LABELS[rec.status]}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className={cn('h-1.5 rounded-full', rec.progress >= 80 ? 'bg-green-500' : rec.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                          style={{ width: `${rec.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{rec.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{rec.direction?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {rec.responsible ? `${rec.responsible.firstName} ${rec.responsible.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium whitespace-nowrap', new Date(rec.dueDate) < new Date() && rec.status !== 'CLOSED' ? 'text-red-600' : 'text-gray-600')}>
                      {formatDate(rec.dueDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/recommendations/${rec.id}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">Détail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {pagination.page}/{pagination.totalPages} ({pagination.total} résultats)</p>
            <div className="flex gap-1">
              <button onClick={() => setFilter((p: any) => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <button onClick={() => setFilter((p: any) => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nouvelle Recommandation */}
      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nouvelle recommandation" size="xl">
        <form onSubmit={handleSubmit(d => createRec.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source *</label>
              <input {...register('source', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Audit Interne, Commissaire aux comptes..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Criticité *</label>
              <select {...register('criticality', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choisir...</option>
                {Object.entries(CRITICALITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Constat *</label>
              <textarea {...register('constat', { required: true })} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Décrire la situation constatée..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Recommandation *</label>
              <textarea {...register('description', { required: true })} rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Décrire l'action recommandée..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Risque *</label>
              <input {...register('risk', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Risque en cas de non mise en œuvre..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Direction *</label>
              <select {...register('directionId', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choisir...</option>
                {(directions || []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Responsable *</label>
              <select {...register('responsibleId', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Choisir...</option>
                {actionOwners.map((u: any) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mission liée</label>
              <select {...register('missionId')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Aucune</option>
                {(missionsData?.items || []).map((m: any) => <option key={m.id} value={m.id}>{m.reference} — {m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Échéance *</label>
              <input {...register('dueDate', { required: true })} type="date"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => { setShowModal(false); reset(); }}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Annuler</button>
            <button type="submit" disabled={createRec.isPending}
              className="px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition flex items-center gap-2 disabled:opacity-50">
              {createRec.isPending && <Loader2 size={14} className="animate-spin" />}
              Créer la recommandation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Changement de Statut */}
      <Modal open={!!showStatusModal} onClose={() => { setShowStatusModal(null); resetStatus(); }} title={`Mettre à jour — ${showStatusModal?.reference}`} size="sm">
        {showStatusModal && (
          <form onSubmit={handleStatusSubmit(d => changeStatus.mutate({ id: showStatusModal.id, ...d }))} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nouveau statut</label>
              <select {...registerStatus('status', { required: true })}
                defaultValue={showStatusModal.status}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Avancement (%)</label>
              <input {...registerStatus('progress')} type="number" min={0} max={100}
                defaultValue={showStatusModal.progress}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Commentaire</label>
              <textarea {...registerStatus('comment')} rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Justification du changement de statut..." />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => { setShowStatusModal(null); resetStatus(); }}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Annuler</button>
              <button type="submit" disabled={changeStatus.isPending}
                className="px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition flex items-center gap-2 disabled:opacity-50">
                {changeStatus.isPending && <Loader2 size={14} className="animate-spin" />}
                Mettre à jour
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
