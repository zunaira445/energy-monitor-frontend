import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import EnergyStatistics from './pages/EnergyStatistics';
import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';
import Devices from './pages/Devices';
import Alerts from './pages/Alerts';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
<Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
  <Route path="/energy-stats" element={<ProtectedRoute><EnergyStatistics /></ProtectedRoute>} />
  <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
</Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;