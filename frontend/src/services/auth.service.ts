import api from '@/lib/axios';

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  },

  logout: async (refreshToken?: string) => {
    await api.post('/auth/logout', { refreshToken });
  },

  refresh: async (refreshToken: string) => {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.post('/auth/change-password', data);
    return res.data.data;
  },
};
