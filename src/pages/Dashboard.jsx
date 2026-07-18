import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import EnergyBarChart from '../components/EnergyBarChart';
import TrendLineChart from '../components/TrendLineChart';
import { getStats, getDailyChart, getTrend, getDevices } from '../api/dashboard';
import { Zap, Activity, Gauge, Battery, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (deviceId) loadDashboardData();
  }, [deviceId]);

  const loadDevices = async () => {
    try {
      const res = await getDevices();
      setDevices(res.data);
      if (res.data.length > 0) {
        setDeviceId(res.data[0].device_id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load devices');
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, dailyRes, trendRes] = await Promise.all([
        getStats(deviceId),
        getDailyChart(deviceId),
        getTrend(deviceId, 144),
      ]);
      setStats(statsRes.data);
      setDailyData(dailyRes.data);
      setTrendData(trendRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading dashboard...</p>
      </Layout>
    );
  }

  if (devices.length === 0) {
    return (
      <Layout>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-4 rounded-lg">
          No devices found. Create a device and import readings first (Phase 3).
        </div>
      </Layout>
    );
  }

  const dailyLabels = dailyData.map((d) => d.date);
  const dailyValues = dailyData.map((d) => d.total_energy_kwh);

  const trendLabels = trendData.map((t) =>
    new Date(t.reading_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const powerTrend = trendData.map((t) => parseFloat(t.power_w));
  const voltageTrend = trendData.map((t) => parseFloat(t.voltage));
  const currentTrend = trendData.map((t) => parseFloat(t.current));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

        {devices.length > 1 && (
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
          >
            {devices.map((d) => (
              <option key={d.device_id} value={d.device_id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard icon={Zap} label="Voltage" value={stats?.current_voltage ?? 0} unit="V" color="blue" />
        <StatCard icon={Activity} label="Current" value={stats?.current_amp ?? 0} unit="A" color="purple" />
        <StatCard icon={Gauge} label="Power" value={stats?.current_power_w ?? 0} unit="W" color="orange" />
        <StatCard icon={Battery} label="Today's Energy" value={stats?.today_energy_kwh ?? 0} unit="kWh" color="green" />
        <StatCard icon={Calendar} label="Monthly Energy" value={stats?.monthly_energy_kwh ?? 0} unit="kWh" color="blue" />
        <StatCard icon={TrendingUp} label="Total Energy" value={stats?.total_energy_kwh ?? 0} unit="kWh" color="purple" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Daily Energy Consumption</h2>
          {dailyData.length > 0 ? (
            <EnergyBarChart labels={dailyLabels} data={dailyValues} />
          ) : (
            <p className="text-gray-400 text-sm">No data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Power Trend (24h)</h2>
          {trendData.length > 0 ? (
            <TrendLineChart labels={trendLabels} data={powerTrend} label="Power (W)" color="#f97316" />
          ) : (
            <p className="text-gray-400 text-sm">No data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Voltage Trend</h2>
          {trendData.length > 0 ? (
            <TrendLineChart labels={trendLabels} data={voltageTrend} label="Voltage (V)" color="#3b82f6" />
          ) : (
            <p className="text-gray-400 text-sm">No data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Current Trend</h2>
          {trendData.length > 0 ? (
            <TrendLineChart labels={trendLabels} data={currentTrend} label="Current (A)" color="#8b5cf6" />
          ) : (
            <p className="text-gray-400 text-sm">No data available</p>
          )}
        </div>
      </div>
    </Layout>
  );
}