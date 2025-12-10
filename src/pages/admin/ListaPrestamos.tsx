import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Edit, Eye, AlertCircle, Plus, DollarSign, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

interface Prestamo {
  id: string;
  numeroSolicitud: string;
  socio: {
    id: string;
    cedula: string;
    nombreCompleto: string;
    email: string;
  };
  tipo: string;
  monto: number;
  montoRestante: number;
  cuotaMensual: number;
  plazo: number;
  plazoRestante: number;
  tasaInteres: number;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  fechaDesembolso?: string;
  fechaProximoPago?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'activo' | 'pagado' | 'vencido';
}

const ListaPrestamos = () => {
  const navigate = useNavigate();
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar autenticación admin
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.rol !== 'ADMIN') {
      navigate('/login');
      return;
    }

    cargarPrestamos();
  }, [navigate]);

  const cargarPrestamos = async () => {
    try {
      setCargando(true);
      
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch('/api/prestamos');
      // const data = await response.json();
      // setPrestamos(data);

      // Datos de ejemplo
      const prestamosEjemplo: Prestamo[] = [
        {
          id: '1',
          numeroSolicitud: 'SOL-2024-00001',
          socio: {
            id: '1',
            cedula: '1234567890',
            nombreCompleto: 'Juan Pérez García',
            email: 'juan.perez@email.com'
          },
          tipo: 'Préstamo Personal',
          monto: 10000000,
          montoRestante: 7500000,
          cuotaMensual: 450000,
          plazo: 24,
          plazoRestante: 18,
          tasaInteres: 12.5,
          fechaSolicitud: '2024-01-15',
          fechaAprobacion: '2024-01-18',
          fechaDesembolso: '2024-01-20',
          fechaProximoPago: '2024-12-15',
          estado: 'activo'
        },
        {
          id: '2',
          numeroSolicitud: 'SOL-2024-00002',
          socio: {
            id: '2',
            cedula: '9876543210',
            nombreCompleto: 'María González López',
            email: 'maria.gonzalez@email.com'
          },
          tipo: 'Préstamo Vehicular',
          monto: 25000000,
          montoRestante: 25000000,
          cuotaMensual: 850000,
          plazo: 36,
          plazoRestante: 36,
          tasaInteres: 11.2,
          fechaSolicitud: '2024-12-05',
          estado: 'pendiente'
        },
        {
          id: '3',
          numeroSolicitud: 'SOL-2024-00003',
          socio: {
            id: '1',
            cedula: '1234567890',
            nombreCompleto: 'Juan Pérez García',
            email: 'juan.perez@email.com'
          },
          tipo: 'Préstamo Hipotecario',
          monto: 150000000,
          montoRestante: 0,
          cuotaMensual: 2100000,
          plazo: 120,
          plazoRestante: 0,
          tasaInteres: 9.8,
          fechaSolicitud: '2020-06-10',
          fechaAprobacion: '2020-06-15',
          fechaDesembolso: '2020-07-01',
          estado: 'pagado'
        }
      ];
      
      setPrestamos(prestamosEjemplo);
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      alert('Error al cargar la lista de préstamos');
    } finally {
      setCargando(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Activo' },
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pendiente' },
      aprobado: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Aprobado' },
      rechazado: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rechazado' },
      pagado: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle, label: 'Completado' },
      vencido: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Vencido' }
    };

    const badge = badges[estado as keyof typeof badges] || badges.pendiente;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} inline-flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const prestamosFiltrados = prestamos.filter(prestamo => {
    const termino = busqueda.toLowerCase();
    const cumpleBusqueda = (
      prestamo.numeroSolicitud.toLowerCase().includes(termino) ||
      prestamo.socio.cedula.includes(termino) ||
      prestamo.socio.nombreCompleto.toLowerCase().includes(termino) ||
      prestamo.tipo.toLowerCase().includes(termino)
    );

    const cumpleEstado = filtroEstado === 'todos' || prestamo.estado === filtroEstado;

    return cumpleBusqueda && cumpleEstado;
  });

  // Estadísticas
  const stats = {
    total: prestamos.length,
    activos: prestamos.filter(p => p.estado === 'activo').length,
    pendientes: prestamos.filter(p => p.estado === 'pendiente').length,
    montoTotal: prestamos.filter(p => p.estado === 'activo').reduce((sum, p) => sum + p.montoRestante, 0)
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando préstamos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Préstamos</h1>
              <p className="text-sm text-gray-600">Administra todos los préstamos de la cooperativa</p>
            </div>
            <button
              onClick={() => navigate('/admin/prestamos/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Préstamo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Préstamos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.activos}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendientes}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cartera Total</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(stats.montoTotal)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por número, socio, cédula o tipo..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="activo">Activos</option>
              <option value="pagado">Pagados</option>
              <option value="rechazado">Rechazados</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>
        </div>

        {/* Tabla de préstamos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {prestamosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {busqueda || filtroEstado !== 'todos' ? 'No se encontraron resultados' : 'No hay préstamos registrados'}
              </h3>
              <p className="text-gray-600 mb-4">
                {busqueda || filtroEstado !== 'todos'
                  ? 'Intenta con otros filtros de búsqueda' 
                  : 'Comienza creando el primer préstamo'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitud
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Socio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prestamosFiltrados.map((prestamo) => (
                    <tr key={prestamo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{prestamo.numeroSolicitud}</div>
                        <div className="text-xs text-gray-500">{formatDate(prestamo.fechaSolicitud)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{prestamo.socio.nombreCompleto}</div>
                        <div className="text-xs text-gray-500">{prestamo.socio.cedula}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prestamo.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(prestamo.monto)}</div>
                        {prestamo.estado === 'activo' && (
                          <div className="text-xs text-gray-500">Saldo: {formatCurrency(prestamo.montoRestante)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">{formatCurrency(prestamo.cuotaMensual)}</div>
                        <div className="text-xs text-gray-500">{prestamo.plazo} meses</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEstadoBadge(prestamo.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/prestamos/${prestamo.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {prestamo.estado === 'pendiente' && (
                            <button
                              onClick={() => navigate(`/admin/prestamos/${prestamo.id}/evaluar`)}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Evaluar solicitud"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen */}
        {prestamosFiltrados.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Mostrando {prestamosFiltrados.length} de {prestamos.length} préstamos
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaPrestamos;