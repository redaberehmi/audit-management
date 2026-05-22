import api from '@/lib/axios';

export const usersService = {
  findAll: async (params: { page?: number; limit?: number; search?: string; role?: string } = {}) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)); });
    const res = await api.get(`/users?${p}`);
    return res.data.data;
  },

  create: async (data: any) => {
    const res = await api.post('/users', data);
    return res.data.data;
  },

  update: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },

  toggleActive: async (id: string) => {
    const res = await api.patch(`/users/${id}/toggle-active`);
    return res.data.data;
  },

  resetPassword: async (id: string, newPassword: string) => {
    const res = await api.post(`/users/${id}/reset-password`, { newPassword });
    return res.data.data;
  },
};
