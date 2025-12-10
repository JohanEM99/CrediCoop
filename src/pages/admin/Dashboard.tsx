import { useNavigate } from 'react-router-dom';
import { LogOut, Users, DollarSign, FileText, UserPlus, ListChecks } from 'lucide-react';
import { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Verificar si está logueado
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    
    // Verificar si es admin
    if (user.rol !== 'ADMIN') {
      navigate('/login');
      return;
    }

    setUserName(user.nombre);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/Logo.png" 
                alt="Credicoop Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrador</h1>
                <p className="text-sm text-gray-600">Bienvenido, {userName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Socios</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Préstamos Activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagos Hoy</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <button 
              onClick={() => navigate('/admin/socios/nuevo')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg flex flex-col items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
            >
              <UserPlus className="w-8 h-8" />
              <span className="font-semibold">Crear Socio</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/socios')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg flex flex-col items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
            >
              <Users className="w-8 h-8" />
              <span className="font-semibold">Ver Socios</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/prestamos/nuevo')}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg flex flex-col items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
            >
              <DollarSign className="w-8 h-8" />
              <span className="font-semibold">Nuevo Préstamo</span>
            </button>
            
            <button 
              onClick={() => navigate('/admin/prestamos')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-lg flex flex-col items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
            >
              <ListChecks className="w-8 h-8" />
              <span className="font-semibold">Ver Préstamos</span>
            </button>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay actividad reciente</p>
            <p className="text-sm text-gray-400 mt-1">Las últimas transacciones aparecerán aquí</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;