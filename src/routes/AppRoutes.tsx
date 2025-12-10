import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import NuevoSocio from '../pages/admin/NuevoSocio';
import ListaSocios from '../pages/admin/ListaSocios';
import EditarSocio from '../pages/admin/EditarSocio';
import ListaPrestamos from '../pages/admin/ListaPrestamos';
import NuevoPrestamo from '../pages/admin/NuevoPrestamo';
import MisPrestamos from '../pages/socio/MisPrestamos';
import SolicitarPrestamo from '../pages/socio/SolicitarPrestamo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/socios" element={<ListaSocios />} />
        <Route path="/admin/socios/nuevo" element={<NuevoSocio />} />
        <Route path="/admin/socios/:id/editar" element={<EditarSocio />} />
        <Route path="/admin/prestamos" element={<ListaPrestamos />} />
        <Route path="/admin/prestamos/nuevo" element={<NuevoPrestamo />} />
        
        {/* Rutas de Socio */}
        <Route path="/socio/mis-prestamos" element={<MisPrestamos />} />
        <Route path="/socio/solicitar-prestamo" element={<SolicitarPrestamo />} />
        
        {/* Ruta fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;