import { useNavigate } from 'react-router-dom';
import { LogOut, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

const MisPrestamos = () => {
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
    
    // Verificar si es socio
    if (user.rol !== 'SOCIO') {
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
              <h1 className="text-2xl font-bold text-gray-900">Mis Préstamos</h1>
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes préstamos activos</h2>
            <p className="text-gray-600">Próximamente podrás ver tus préstamos aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisPrestamos;