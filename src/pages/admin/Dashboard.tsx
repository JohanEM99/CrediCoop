import { useNavigate } from 'react-router-dom';
import { LogOut, Users, DollarSign, FileText } from 'lucide-react';
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrador</h1>
              <p className="text-sm text-gray-600">Bienvenido, {userName}</p>
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

        {/* Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximamente</h2>
          <p className="text-gray-600">
            Aquí aparecerán las funcionalidades de gestión de socios, préstamos y pagos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;