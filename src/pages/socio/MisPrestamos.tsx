import { useNavigate } from 'react-router-dom';
import { LogOut, CreditCard, Plus, Calendar, DollarSign, Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Prestamo {
  id: string;
  tipo: string;
  monto: number;
  montoRestante: number;
  cuotaMensual: number;
  plazo: number;
  plazoRestante: number;
  tasaInteres: number;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  fechaProximoPago?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'activo' | 'pagado' | 'vencido';
  numeroSolicitud: string;
}

const MisPrestamos = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [vistaActual, setVistaActual] = useState<'activos' | 'solicitudes' | 'historial'>('activos');
  const [cargando, setCargando] = useState(true);
  
  // Estados para datos desde backend
  const [prestamosActivos, setPrestamosActivos] = useState<Prestamo[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<Prestamo[]>([]);
  const [historial, setHistorial] = useState<Prestamo[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    
    if (user.rol !== 'SOCIO') {
      navigate('/login');
      return;
    }

    setUserName(user.nombre);

    // Cargar datos del socio
    cargarDatosSocio();
  }, [navigate]);

  const cargarDatosSocio = async () => {
    try {
      setCargando(true);
      
      // TODO: Llamar al backend para obtener los datos
      // const activos = await obtenerPrestamosActivos(socioId);
      // setPrestamosActivos(activos);
      
      // const pendientes = await obtenerSolicitudesPendientes(socioId);
      // setSolicitudesPendientes(pendientes);
      
      // const historialData = await obtenerHistorial(socioId);
      // setHistorial(historialData);

      // Por ahora dejamos los arrays vacíos
      setPrestamosActivos([]);
      setSolicitudesPendientes([]);
      setHistorial([]);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // TODO: Mostrar notificación de error
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSolicitarPrestamo = () => {
    navigate('/socio/solicitar-prestamo');
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
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En Revisión' },
      aprobado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Aprobado' },
      rechazado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
      pagado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pagado' },
      vencido: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' }
    };

    const badge = badges[estado as keyof typeof badges] || badges.pendiente;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getEstadoIcon = (estado: string) => {
    const icons = {
      activo: <CheckCircle className="w-5 h-5 text-green-500" />,
      pendiente: <Clock className="w-5 h-5 text-yellow-500" />,
      aprobado: <CheckCircle className="w-5 h-5 text-blue-500" />,
      rechazado: <XCircle className="w-5 h-5 text-red-500" />,
      pagado: <CheckCircle className="w-5 h-5 text-gray-500" />,
      vencido: <AlertCircle className="w-5 h-5 text-red-500" />
    };

    return icons[estado as keyof typeof icons] || icons.pendiente;
  };

  const calcularProgreso = (prestamo: Prestamo) => {
    const pagado = prestamo.monto - prestamo.montoRestante;
    return (pagado / prestamo.monto) * 100;
  };

  // Resumen general
  const resumen = {
    totalActivos: prestamosActivos.length,
    deudaTotal: prestamosActivos.reduce((sum, p) => sum + p.montoRestante, 0),
    pagoMensualTotal: prestamosActivos.reduce((sum, p) => sum + p.cuotaMensual, 0),
    solicitudesPendientes: solicitudesPendientes.length
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal del Socio</h1>
              <p className="text-sm text-gray-600">Bienvenido, {userName}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSolicitarPrestamo}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Solicitar Préstamo
              </button>
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
      </div>

      {/* Tarjetas de resumen */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Préstamos Activos</p>
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{resumen.totalActivos}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Deuda Total</p>
              <DollarSign className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumen.deudaTotal)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pago Mensual</p>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumen.pagoMensualTotal)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">En Revisión</p>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{resumen.solicitudesPendientes}</p>
          </div>
        </div>

        {/* Navegación de pestañas */}
        <div className="bg-white rounded-t-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setVistaActual('activos')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  vistaActual === 'activos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Préstamos Activos ({prestamosActivos.length})
              </button>
              <button
                onClick={() => setVistaActual('solicitudes')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  vistaActual === 'solicitudes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Solicitudes ({solicitudesPendientes.length})
              </button>
              <button
                onClick={() => setVistaActual('historial')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  vistaActual === 'historial'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Historial ({historial.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido según vista */}
        <div className="bg-white rounded-b-lg shadow p-6">
          {/* Vista de Préstamos Activos */}
          {vistaActual === 'activos' && (
            <div>
              {prestamosActivos.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes préstamos activos</h3>
                  <p className="text-gray-600 mb-4">Solicita tu primer préstamo para comenzar</p>
                  <button
                    onClick={handleSolicitarPrestamo}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Solicitar Préstamo
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {prestamosActivos.map((prestamo) => (
                    <div key={prestamo.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getEstadoIcon(prestamo.estado)}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{prestamo.tipo}</h3>
                            <p className="text-sm text-gray-600">Solicitud: {prestamo.numeroSolicitud}</p>
                          </div>
                        </div>
                        {getEstadoBadge(prestamo.estado)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Monto Original</p>
                          <p className="text-lg font-semibold">{formatCurrency(prestamo.monto)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Saldo Pendiente</p>
                          <p className="text-lg font-semibold text-red-600">{formatCurrency(prestamo.montoRestante)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Cuota Mensual</p>
                          <p className="text-lg font-semibold text-blue-600">{formatCurrency(prestamo.cuotaMensual)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Próximo Pago</p>
                          <p className="text-sm font-semibold">{prestamo.fechaProximoPago ? formatDate(prestamo.fechaProximoPago) : 'N/A'}</p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progreso de pago</span>
                          <span className="font-semibold">{prestamo.plazo - prestamo.plazoRestante} / {prestamo.plazo} cuotas</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${calcularProgreso(prestamo)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{calcularProgreso(prestamo).toFixed(1)}% completado</p>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Ver Detalles
                        </button>
                        <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Realizar Pago
                        </button>
                        <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista de Solicitudes Pendientes */}
          {vistaActual === 'solicitudes' && (
            <div>
              {solicitudesPendientes.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes solicitudes pendientes</h3>
                  <p className="text-gray-600">Todas tus solicitudes han sido procesadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {solicitudesPendientes.map((solicitud) => (
                    <div key={solicitud.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Clock className="w-6 h-6 text-yellow-600" />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{solicitud.tipo}</h3>
                            <p className="text-sm text-gray-600">Solicitud: {solicitud.numeroSolicitud}</p>
                          </div>
                        </div>
                        {getEstadoBadge(solicitud.estado)}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Monto Solicitado</p>
                          <p className="text-lg font-semibold">{formatCurrency(solicitud.monto)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Plazo</p>
                          <p className="text-lg font-semibold">{solicitud.plazo} meses</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Fecha de Solicitud</p>
                          <p className="text-sm font-semibold">{formatDate(solicitud.fechaSolicitud)}</p>
                        </div>
                      </div>

                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-900">Tu solicitud está en revisión</p>
                            <p className="text-xs text-yellow-800 mt-1">El proceso de evaluación puede tomar de 2 a 5 días hábiles. Te notificaremos por correo cuando tengamos una respuesta.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista de Historial */}
          {vistaActual === 'historial' && (
            <div>
              {historial.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin historial</h3>
                  <p className="text-gray-600">Aún no tienes préstamos finalizados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historial.map((prestamo) => (
                    <div key={prestamo.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getEstadoIcon(prestamo.estado)}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{prestamo.tipo}</h3>
                            <p className="text-sm text-gray-600">Solicitud: {prestamo.numeroSolicitud}</p>
                          </div>
                        </div>
                        {getEstadoBadge(prestamo.estado)}
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Monto</p>
                          <p className="text-sm font-semibold">{formatCurrency(prestamo.monto)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Plazo</p>
                          <p className="text-sm font-semibold">{prestamo.plazo} meses</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Fecha Solicitud</p>
                          <p className="text-xs font-semibold">{formatDate(prestamo.fechaSolicitud)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Estado Final</p>
                          <p className="text-sm font-semibold text-green-600">Completado</p>
                        </div>
                      </div>

                      <button className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        Ver Certificado de Pago
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisPrestamos;