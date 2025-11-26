import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import NuevoSocio from '../pages/admin/NuevoSocio';
import MisPrestamos from '../pages/socio/MisPrestamos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/socios/nuevo" element={<NuevoSocio />} />
        <Route path="/socio/prestamos" element={<MisPrestamos />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;