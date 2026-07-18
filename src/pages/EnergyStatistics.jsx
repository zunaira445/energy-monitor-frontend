import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EnergyBarChart from '../components/EnergyBarChart';
import { getStats, getDailyChart, getMonthlyChart, getDevices } from '../api/dashboard';
import { getSettings } from '../api/settings';
import { HelpCircle, ChevronLeft, Leaf, Edit2 } from 'lucide-react';

export default function EnergyStatistics() {
  const [view, setView] = useState('daily'); // 'daily' | 'monthly'
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const devRes = await getDevices();
      setDevices(devRes.data);
      if (devRes.data.length > 0) setDeviceId(devRes.data[0].device_id);
      const settingsRes = await getSettings();
      setSettings(settingsRes.data);
    })();
  }, []);

  useEffect(() => {
    if (deviceId) loadData();
  }, [deviceId, view]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await getStats(deviceId);
      setStats(statsRes.data);

      const chartRes = view === 'daily'
        ? await getDailyChart(deviceId)
        : await getMonthlyChart(deviceId);
      setChartData(chartRes.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Layout>
        <p className="text-gray-500">Loading...</p>
      </Layout>
    );
  }

  const energyValue = view === 'daily' ? stats.today_energy_kwh : stats.monthly_energy_kwh;
  const expenses = settings ? (energyValue * parseFloat(settings.unit_price || 0)).toFixed(2) : '0.00';
  const labels = chartData.map((d) => view === 'daily' ? d.date?.slice(5) : d.month);
  const values = chartData.map((d) => d.total_energy_kwh);

  const monthlyTarget = parseFloat(settings?.monthly_target_kwh) || 200;
  const remaining = Math.max(monthlyTarget - (stats.monthly_energy_kwh ?? 0), 0);
  const targetPercent = Math.min(((stats.monthly_energy_kwh ?? 0) / monthlyTarget) * 100, 100);

  const room = devices.find((d) => d.device_id === deviceId);

  const tips = [
    'Make sure all doors and windows are closed when AC is on.',
    '10% - 20% electricity consumption can be saved if the filter screen is cleaned regularly.',
    'Avoid turning it on frequently. Unplug it if it is not in use.',
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronLeft className="text-gray-400" size={20} />
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Energy statistics</h1>
          </div>
          <HelpCircle className="text-gray-400" size={20} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          {/* Daily / Monthly toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 mb-5">
            <button
              onClick={() => setView('daily')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                view === 'daily' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                view === 'monthly' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Energy / Expenses */}
          <div className="flex justify-between mb-5">
            <div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                <span>⚡</span> Energy
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {energyValue?.toFixed(2) ?? '0.00'} <span className="text-sm font-normal text-gray-400">kWh</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                <span>📊</span> Expenses
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {expenses} <span className="text-sm font-normal text-gray-400">Rs</span>
                <Edit2 size={14} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Saved banner */}
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg px-4 py-2.5 flex items-center justify-between mb-5 text-sm">
            <div className="flex items-center gap-2">
              <Leaf size={16} />
              <span>Saved</span>
            </div>
            <span className="font-medium">0.00 kWh | --</span>
          </div>

          {/* Bar chart */}
          <div className="mb-5">
            {chartData.length > 0 ? (
              <EnergyBarChart labels={labels} data={values} label="kWh" />
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">No data available</p>
            )}
          </div>

          {/* Room card */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
            <div className="font-medium text-gray-800 dark:text-white mb-3">
              {room?.name ?? 'Device'}
            </div>
            <div className="flex justify-between text-sm mb-3">
              <div>
                <div className="text-gray-500">{view === 'daily' ? 'Daily' : 'Monthly'} Usage</div>
                <div className="font-bold text-gray-800 dark:text-white">
                  {energyValue?.toFixed(2) ?? '0.00'} <span className="text-xs font-normal text-gray-400">kWh</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">{view === 'daily' ? 'Daily' : 'Monthly'} usage time</div>
                <div className="font-bold text-gray-800 dark:text-white">-- <span className="text-xs font-normal text-gray-400">h</span></div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs mt-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm inline-block" />
                <span className="text-gray-500">Standard operation</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-sm inline-block" />
                <span className="text-gray-500">Energy-saving operation</span>
              </div>
            </div>
          </div>

          {/* Monthly target */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800 dark:text-white">Energy consumption target</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Monthly target</span>
              <span className="text-blue-600 font-semibold">Remaining {remaining.toFixed(2)}kWh</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-1">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${targetPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Upper limit: {monthlyTarget.toFixed(2)}kWh</span>
            </div>
          </div>

          {/* Energy saving tips */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Energy-saving tips</h3>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="text-sm text-gray-600 dark:text-gray-300 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}