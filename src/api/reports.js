import api from './axios';

export const getReport = (type, deviceId, date) =>
  api.get('/reports', { params: { type, device_id: deviceId, date } });

// For downloads, we fetch as blob because it needs the Authorization header
export const downloadReport = async (format, type, deviceId, date) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ type, device_id: deviceId || '', date: date || '' });
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/export/${format}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};