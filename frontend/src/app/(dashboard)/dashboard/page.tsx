'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useAuthStore } from '@/stores/auth.store';
import { DGDashboard } from '@/components/dashboard/DGDashboard';
import { AuditDashboard } from '@/components/dashboard/AuditDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isDG = user?.role === 'DG' || user?.role === 'ADMIN';

  const { data, isLoading } = useQuery({
    queryKey: [isDG ? 'dg-dashboard' : 'audit-dashboard'],
    queryFn: () => isDG ? dashboardService.getDGDashboard() : dashboardService.getAuditDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return isDG ? <DGDashboard data={data?.data} /> : <AuditDashboard data={data?.data} />;
}
