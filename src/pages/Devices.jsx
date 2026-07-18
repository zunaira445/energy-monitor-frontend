import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getDevices, createDevice, updateDevice, deleteDevice } from '../api/devices';
import { Plus, Trash2, Wifi, WifiOff, X } from 'lucide-react';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ device_id: '', name: '', room: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDevices();
      setDevices(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createDevice(form);
      setForm({ device_id: '', name: '', room: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create device');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this device and all its readings?')) return;
    await deleteDevice(id);
    load();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Devices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Add Device
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 mb-6 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400">
            <X size={18} />
          </button>
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">New Device</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg mb-3">{error}</div>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Device ID (e.g. ESP32-001)"
              value={form.device_id}
              onChange={(e) => setForm({ ...form, device_id: e.target.value })}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Device Name (e.g. Living Room AC)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Room (optional)"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="md:col-span-3 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create Device
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading devices...</p>
      ) : devices.length === 0 ? (
        <p className="text-gray-500">No devices yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((d) => (
            <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{d.name}</h3>
                  <p className="text-xs text-gray-400">{d.device_id}</p>
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">{d.room || 'No room set'}</p>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  d.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {d.status === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />} {d.status}
                </span>
                <span className="text-xs text-gray-400">
                  {d.last_update ? new Date(d.last_update).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}