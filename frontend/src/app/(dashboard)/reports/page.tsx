'use client';

import { useState } from 'react';
import { BarChart3, FileText, Download, Calendar, Building2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const REPORTS = [
  {
    id: 'monthly-excel', title: 'Rapport mensuel', fmt: 'excel',
    description: 'Synthèse des recommandations créées, clôturées et en retard pour la période sélectionnée.',
    icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', btnColor: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    endpoint: (y: number, m: number) => `/reports/monthly/excel?year=${y}&month=${m}`,
    filename: (y: number, m: number) => `rapport-mensuel-${y}-${m}.xlsx`,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    id: 'monthly-pdf', title: 'Rapport mensuel PDF', fmt: 'pdf',
    description: 'Rapport exécutif PDF avec KPIs et synthèse pour la Direction Générale.',
    icon: FileText, color: 'text-red-600', bg: 'bg-red-50', btnColor: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    endpoint: (y: number, m: number) => `/reports/monthly/pdf?year=${y}&month=${m}`,
    filename: (y: number, m: number) => `rapport-mensuel-${y}-${m}.pdf`,
    mime: 'application/pdf',
  },
  {
    id: 'recommendations-excel', title: 'Export recommandations', fmt: 'excel',
    description: 'Export complet de toutes les recommandations avec tous les champs disponibles.',
    icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50', btnColor: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    endpoint: () => '/recommendations/export/excel',
    filename: () => `recommandations-${Date.now()}.xlsx`,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    id: 'overdue', title: 'Rapport des retards', fmt: 'excel',
    description: 'Liste exhaustive des recommandations en retard avec ancienneté et responsables.',
    icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', btnColor: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    endpoint: (y: number, m: number) => `/reports/monthly/excel?year=${y}&month=${m}&filterOverdue=true`,
    filename: (y: number, m: number) => `retards-${y}-${m}.xlsx`,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    id: 'by-direction', title: 'Par direction', fmt: 'excel',
    description: 'Analyse détaillée des recommandations par direction avec taux de clôture.',
    icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', btnColor: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    endpoint: (y: number, m: number) => `/reports/monthly/excel?year=${y}&month=${m}`,
    filename: (y: number, m: number) => `rapport-directions-${y}-${m}.xlsx`,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
];

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (report: typeof REPORTS[0]) => {
    setLoading(report.id);
    try {
      const url = report.endpoint(year, month);
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: report.mime });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = report.filename(year, month);
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: `${report.title} téléchargé ✅` });
    } catch (e: any) {
      toast({ title: 'Erreur lors du téléchargement', description: 'Vérifiez que le backend est accessible.', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Rapports & Exports</h1>
        <p className="text-sm text-gray-500">Générez vos rapports d'audit en Excel ou PDF</p>
      </div>

      {/* Sélecteur période */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Période de référence</h3>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Année</label>
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Mois</label>
            <select value={month} onChange={e => setMonth(+e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grille rapports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map(report => {
          const Icon = report.icon;
          const isLoading = loading === report.id;
          return (
            <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('p-2.5 rounded-xl flex-shrink-0', report.bg)}>
                  <Icon className={cn('w-5 h-5', report.color)} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{report.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{report.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(report)}
                disabled={isLoading}
                className={cn(
                  'flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition border mt-4 disabled:opacity-50',
                  report.btnColor,
                )}
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                {isLoading ? 'Génération...' : `Télécharger ${report.fmt.toUpperCase()}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
