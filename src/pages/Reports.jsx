import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getReport, downloadReport } from '../api/reports';
import { getDevices } from '../api/dashboard';
import { FileDown, FileSpreadsheet, Printer, Zap, Gauge, TrendingUp, TrendingDown } from 'lucide-react';

export default function Reports() {
  const [type, setType] = useState('daily');
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    (async () => {
      const res = await getDevices();
      setDevices(res.data);
      if (res.data.length > 0) setDeviceId(res.data[0].device_id);
    })();
  }, []);

  useEffect(() => {
    if (deviceId) loadReport();
  }, [deviceId, type]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await getReport(type, deviceId);
      setReport(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      await downloadReport(format, type, deviceId);
    } catch (err) {
      alert('Download failed');
    } finally {
      setDownloading('');
    }
  };

  const handlePrint = () => window.print();

  const reportTypes = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>

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

      {/* Report type tabs */}
      <div className="flex gap-2 mb-6 print:hidden">
        {reportTypes.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              type === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading || !report ? (
        <p className="text-gray-500">Loading report...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">{type} Report</h2>
              <p className="text-sm text-gray-500">
                {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading === 'pdf'}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
              >
                <FileDown size={16} /> {downloading === 'pdf' ? 'Downloading...' : 'PDF'}
              </button>
              <button
                onClick={() => handleDownload('excel')}
                disabled={downloading === 'excel'}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 disabled:opacity-50"
              >
                <FileSpreadsheet size={16} /> {downloading === 'excel' ? 'Downloading...' : 'Excel'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs mb-1">
                <Zap size={14} /> Total Units
              </div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">{report.total_units} kWh</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs mb-1">
                <Gauge size={14} /> Average Power
              </div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">{report.avg_power} W</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mb-1">
                <TrendingUp size={14} /> Peak Power
              </div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">{report.peak_power} W</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs mb-1">
                <TrendingDown size={14} /> Minimum Power
              </div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">{report.min_power} W</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Average Voltage</div>
              <div className="font-semibold text-gray-800 dark:text-white">{report.avg_voltage} V</div>
            </div>
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Average Current</div>
              <div className="font-semibold text-gray-800 dark:text-white">{report.avg_current} A</div>
            </div>
            <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Total Readings</div>
              <div className="font-semibold text-gray-800 dark:text-white">{report.readings_count}</div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}