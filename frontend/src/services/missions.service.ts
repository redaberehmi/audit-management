import api from '@/lib/axios';

export const missionsService = {
  findAll: async (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)); });
    const res = await api.get(`/missions?${p}`);
    return res.data.data;
  },

  findOne: async (id: string) => {
    const res = await api.get(`/missions/${id}`);
    return res.data.data;
  },

  create: async (data: any) => {
    const res = await api.post('/missions', data);
    return res.data.data;
  },

  update: async (id: string, data: any) => {
    const res = await api.put(`/missions/${id}`, data);
    return res.data.data;
  },

  archive: async (id: string) => {
    const res = await api.patch(`/missions/${id}/archive`);
    return res.data.data;
  },
};
