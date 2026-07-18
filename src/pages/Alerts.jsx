import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAlerts, markAlertRead, deleteAlert } from '../api/alerts';
import { AlertTriangle, Zap, Gauge, WifiOff, Trash2, Check } from 'lucide-react';

const iconMap = {
  high_power: { icon: Gauge, color: 'text-red-600 bg-red-50' },
  low_voltage: { icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
  high_current: { icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
  device_offline: { icon: WifiOff, color: 'text-gray-600 bg-gray-100' },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAlerts();
      setAlerts(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    await markAlertRead(id);
    load();
  };

  const handleDelete = async (id) => {
    await deleteAlert(id);
    load();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Alerts</h1>

      {loading ? (
        <p className="text-gray-500">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-gray-500">No alerts. Everything looks good! ✅</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const conf = iconMap[a.type] || iconMap.device_offline;
            const Icon = conf.icon;
            return (
              <div
                key={a.id}
                className={`flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border p-4 ${
                  a.is_read ? 'border-gray-100 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${conf.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{a.message}</p>
                    <p className="text-xs text-gray-400">
                      {a.Device?.name} • {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!a.is_read && (
                    <button onClick={() => handleRead(a.id)} className="text-gray-400 hover:text-green-600">
                      <Check size={18} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}