import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getUsers, updateUserRole, deleteUser } from '../api/admin';
import { getDevices, deleteDevice } from '../api/devices';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Trash2, ShieldCheck, User as UserIcon, Cpu } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'users') {
        const res = await getUsers();
        setUsers(res.data);
      } else {
        const res = await getDevices();
        setDevices(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    await updateUserRole(u.id, newRole);
    load();
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await deleteUser(id);
    load();
  };

  const handleDeleteDevice = async (id) => {
    if (!confirm('Delete this device and all its readings?')) return;
    await deleteDevice(id);
    load();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <ShieldCheck className="text-blue-600" /> Admin Panel
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <UserIcon size={16} /> Users
        </button>
        <button
          onClick={() => setTab('devices')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'devices' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Cpu size={16} /> Devices
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tab === 'users' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 text-gray-800 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleRoleToggle(u)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button onClick={() => handleDeleteUser(u.id)} className="text-gray-300 hover:text-red-500 inline-block align-middle">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Device ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Room</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 text-gray-800 dark:text-white">{d.device_id}</td>
                  <td className="px-4 py-3 text-gray-500">{d.name}</td>
                  <td className="px-4 py-3 text-gray-500">{d.room || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      d.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteDevice(d.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}