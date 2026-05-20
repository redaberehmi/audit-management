'use client';

import { useState } from 'react';
import { BarChart3, FileText, Download, Calendar, Building2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const REPORT_TYPES = [
  {
    id: 'monthly',
    title: 'Rapport mensuel',
    description: 'Synthèse des recommandations créées, clôturées et en retard sur une période mensuelle.',
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    formats: ['Excel', 'PDF'],
  },
  {
    id: 'by-direction',
    title: 'Rapport par direction',
    description: 'Analyse détaillée des recommandations par direction avec taux de clôture et criticités.',
    icon: Building2,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    formats: ['Excel'],
  },
  {
    id: 'overdue',
    title: 'Rapport des retards',
    description: 'Liste exhaustive des recommandations en retard avec ancienneté et responsables.',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    formats: ['Excel', 'PDF'],
  },
  {
    id: 'critical',
    title: 'Rapport critiques',
    description: 'Focus sur les recommandations de criticité haute et critique non encore clôturées.',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    formats: ['Excel', 'PDF'],
  },
  {
    id: 'full',
    title: 'Rapport global',
    description: 'Export complet de toutes les recommandations avec tous les champs disponibles.',
    icon: BarChart3,
    color: 'text-green-600',
    bg: 'bg-green-50',
    formats: ['Excel'],
  },
  {
    id: 'dg',
    title: 'Rapport DG',
    description: 'Rapport exécutif avec KPIs, graphiques et synthèse pour la Direction Générale.',
    icon: FileText,
    color: 'text-[#1e3a5f]',
    bg: 'bg-slate-50',
    formats: ['PDF'],
  },
];

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (reportId: string, format: string) => {
    setGenerating(`${reportId}-${format}`);
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(null);
    alert(`Rapport "${reportId}" en format ${format} généré (simulation). Connectez le backend pour l'export réel.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Rapports & Exports</h1>
        <p className="text-sm text-gray-500">Générez vos rapports d'audit en Excel ou PDF</p>
      </div>

      {/* Sélecteur période */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Période de rapport</h3>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(+e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(+e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grille rapports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn('p-2.5 rounded-xl', report.bg)}>
                  <Icon className={cn('w-5 h-5', report.color)} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{report.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{report.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                {report.formats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleGenerate(report.id, fmt)}
                    disabled={generating === `${report.id}-${fmt}`}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition flex-1 justify-center',
                      fmt === 'PDF'
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100',
                      generating === `${report.id}-${fmt}` && 'opacity-50 cursor-wait',
                    )}
                  >
                    <Download size={12} />
                    {generating === `${report.id}-${fmt}` ? 'Génération...' : fmt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
