import api from './axios';

export const getAlerts = () => api.get('/alerts');
export const markAlertRead = (id) => api.put(`/alerts/${id}/read`);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);