import api from '@/lib/axios';

export const referentialsService = {
  getDirections: async () => {
    const res = await api.get('/referentials/directions');
    return res.data.data;
  },
};
