import api from '@/lib/axios';

export const dashboardService = {
  getDGDashboard: async (filters?: { directionId?: string; year?: number }) => {
    const params = new URLSearchParams();
    if (filters?.directionId) params.set('directionId', filters.directionId);
    if (filters?.year) params.set('year', String(filters.year));
    const res = await api.get(`/dashboard/dg?${params}`);
    return res.data;
  },

  getAuditDashboard: async () => {
    const res = await api.get('/dashboard/audit');
    return res.data;
  },
};
