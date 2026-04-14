import api from './api';

export const usersService = {
  async getAddresses() {
    const { data } = await api.get('/users/addresses');
    return data;
  },

  async addAddress(addressData: any) {
    const { data } = await api.post('/users/addresses', addressData);
    return data;
  },

  async updateAddress(id: number, addressData: any) {
    const { data } = await api.patch(`/users/addresses/${id}`, addressData);
    return data;
  },

  async deleteAddress(id: number) {
    const { data } = await api.delete(`/users/addresses/${id}`);
    return data;
  },

  async updateProfile(profileData: { fullName?: string; email?: string; phone?: string }) {
    const { data } = await api.patch('/users/profile', profileData);
    return data;
  },

  async changePassword(password: string) {
    const { data } = await api.patch('/users/password', { password });
    return data;
  }
};
