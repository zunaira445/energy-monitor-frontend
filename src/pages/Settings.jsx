import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getSettings, updateSettings } from '../api/settings';
import { Save } from 'lucide-react';

export default function Settings() {
  const [form, setForm] = useState({ monthly_target_kwh: '', unit_price: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getSettings();
        setForm({
          monthly_target_kwh: parseFloat(res.data.monthly_target_kwh) || 0,
          unit_price: parseFloat(res.data.unit_price) || 0,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateSettings(form);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading settings...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

      <div className="max-w-lg bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        {message && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monthly Energy Target (kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.monthly_target_kwh}
              onChange={(e) => setForm({ ...form, monthly_target_kwh: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Used to calculate "Remaining" on Energy Statistics page</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit Price (Rs per kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Used to calculate Expenses on Energy Statistics page</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </Layout>
  );
}