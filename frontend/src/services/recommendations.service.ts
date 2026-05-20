import api from '@/lib/axios';

export interface RecommendationFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  criticality?: string;
  directionId?: string;
  missionId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const recommendationsService = {
  findAll: async (filter: RecommendationFilter = {}) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
    const res = await api.get(`/recommendations?${params}`);
    return res.data.data;
  },

  findOne: async (id: string) => {
    const res = await api.get(`/recommendations/${id}`);
    return res.data.data;
  },

  create: async (data: any) => {
    const res = await api.post('/recommendations', data);
    return res.data.data;
  },

  update: async (id: string, data: any) => {
    const res = await api.put(`/recommendations/${id}`, data);
    return res.data.data;
  },

  changeStatus: async (id: string, status: string, comment?: string, progress?: number) => {
    const res = await api.patch(`/recommendations/${id}/status`, { status, comment, progress });
    return res.data.data;
  },

  exportExcel: async (filter: RecommendationFilter = {}) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
    const res = await api.get(`/recommendations/export/excel?${params}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recommandations-${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
