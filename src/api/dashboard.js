import api from './axios';

export const getStats = (deviceId) =>
  api.get(`/dashboard/stats${deviceId ? `?device_id=${deviceId}` : ''}`);

export const getDailyChart = (deviceId) =>
  api.get(`/dashboard/chart/daily${deviceId ? `?device_id=${deviceId}` : ''}`);

export const getMonthlyChart = (deviceId) =>
  api.get(`/dashboard/chart/monthly${deviceId ? `?device_id=${deviceId}` : ''}`);

export const getTrend = (deviceId, limit) =>
  api.get(`/dashboard/trend?device_id=${deviceId || ''}&limit=${limit || 144}`);

export const getDevices = () => api.get('/devices');