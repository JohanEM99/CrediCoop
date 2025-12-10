import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search, User, DollarSign, Calendar, Percent, Calculator, FileText } from 'lucide-react';

interface Socio {
  id: string;
  cedula: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  estado: 'activo' | 'inactivo';
}

interface TipoPrestamo {
  id: string;
  nombre: string;
  tasaInteres: number;
  plazoMinimo: number;
  plazoMaximo: number;
  montoMinimo: number;
  montoMaximo: number;
}

interface Simulacion {
  montoSolicitado: number;
  plazoMeses: number;
  tasaInteres: number;
  cuotaMensual: number;
  totalIntereses: number;
  totalPagar: number;
}

const NuevoPrestamo = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [busquedaSocio, setBusquedaSocio] = useState('');
  const [socioSeleccionado, setSocioSeleccionado] = useState<Socio | null>(null);
  const [sociosEncontrados, setSociosEncontrados] = useState<Socio[]>([]);
  const [buscandoSocio, setBuscandoSocio] = useState(false);
  
  const [tipoPrestamo, setTipoPrestamo] = useState('');
  const [monto, setMonto] = useState('');
  const [plazo, setPlazo] = useState('');
  const [destino, setDestino] = useState('');
  const [fechaDesembolso, setFechaDesembolso] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  const [simulacion, setSimulacion] = useState<Simulacion | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.rol !== 'ADMIN') {
      navigate('/login');
    }
  }, [navigate]);

  // Tipos de préstamo (esto vendría del backend)
  const tiposPrestamo: TipoPrestamo[] = [
    {
      id: '1',
      nombre: 'Préstamo Personal',
      tasaInteres: 12.5,
      plazoMinimo: 6,
      plazoMaximo: 60,
      montoMinimo: 1000000,
      montoMaximo: 50000000
    },
    {
      id: '2',
      nombre: 'Préstamo Hipotecario',
      tasaInteres: 9.8,
      plazoMinimo: 60,
      plazoMaximo: 240,
      montoMinimo: 50000000,
      montoMaximo: 500000000
    },
    {
      id: '3',
      nombre: 'Préstamo Vehicular',
      tasaInteres: 11.2,
      plazoMinimo: 12,
      plazoMaximo: 72,
      montoMinimo: 5000000,
      montoMaximo: 100000000
    }
  ];

  // Buscar socio
  const buscarSocio = async () => {
    if (!busquedaSocio || busquedaSocio.length < 3) return;

    try {
      setBuscandoSocio(true);
      
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`/api/socios/buscar?q=${busquedaSocio}`);
      // const data = await response.json();
      // setSociosEncontrados(data);

      // Datos de ejemplo
      const sociosEjemplo: Socio[] = [
        {
          id: '1',
          cedula: '1234567890',
          nombreCompleto: 'Juan Pérez García',
          email: 'juan.perez@email.com',
          telefono: '3001234567',
          estado: 'activo' as const
        },
        {
          id: '2',
          cedula: '9876543210',
          nombreCompleto: 'María González López',
          email: 'maria.gonzalez@email.com',
          telefono: '3109876543',
          estado: 'activo' as const
        }
      ].filter(s => 
        s.cedula.includes(busquedaSocio) ||
        s.nombreCompleto.toLowerCase().includes(busquedaSocio.toLowerCase())
      );
      
      setSociosEncontrados(sociosEjemplo);
    } catch (error) {
      console.error('Error al buscar socio:', error);
    } finally {
      setBuscandoSocio(false);
    }
  };

  // Seleccionar socio
  const seleccionarSocio = (socio: Socio) => {
    setSocioSeleccionado(socio);
    setSociosEncontrados([]);
    setBusquedaSocio('');
  };

  // Calcular simulación
  useEffect(() => {
    if (!tipoPrestamo || !monto || !plazo) {
      setSimulacion(null);
      return;
    }

    const tipo = tiposPrestamo.find(t => t.id === tipoPrestamo);
    if (!tipo) return;

    const m = parseFloat(monto);
    const p = parseInt(plazo);
    const r = tipo.tasaInteres / 100 / 12;

    if (m > 0 && p > 0) {
      const cuota = (m * r * Math.pow(1 + r, p)) / (Math.pow(1 + r, p) - 1);
      const totalPagar = cuota * p;
      const totalIntereses = totalPagar - m;

      setSimulacion({
        montoSolicitado: m,
        plazoMeses: p,
        tasaInteres: tipo.tasaInteres,
        cuotaMensual: cuota,
        totalIntereses: totalIntereses,
        totalPagar: totalPagar
      });
    }
  }, [monto, plazo, tipoPrestamo]);

  // Validaciones
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!socioSeleccionado) {
      newErrors.socio = 'Debes seleccionar un socio';
    }

    if (!tipoPrestamo) {
      newErrors.tipo = 'Selecciona un tipo de préstamo';
    }

    const tipo = tiposPrestamo.find(t => t.id === tipoPrestamo);
    const m = parseFloat(monto);
    const p = parseInt(plazo);

    if (!monto || m <= 0) {
      newErrors.monto = 'El monto es obligatorio';
    } else if (tipo && (m < tipo.montoMinimo || m > tipo.montoMaximo)) {
      newErrors.monto = `El monto debe estar entre ${formatCurrency(tipo.montoMinimo)} y ${formatCurrency(tipo.montoMaximo)}`;
    }

    if (!plazo || p <= 0) {
      newErrors.plazo = 'El plazo es obligatorio';
    } else if (tipo && (p < tipo.plazoMinimo || p > tipo.plazoMaximo)) {
      newErrors.plazo = `El plazo debe estar entre ${tipo.plazoMinimo} y ${tipo.plazoMaximo} meses`;
    }

    if (!destino || destino.length < 10) {
      newErrors.destino = 'Describe el destino del préstamo (mínimo 10 caracteres)';
    }

    if (!fechaDesembolso) {
      newErrors.fecha = 'Selecciona la fecha de desembolso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsLoading(true);

      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch('/api/prestamos', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     socioId: socioSeleccionado?.id,
      //     tipoPrestamo,
      //     monto: parseFloat(monto),
      //     plazo: parseInt(plazo),
      //     destino,
      //     fechaDesembolso,
      //     observaciones
      //   })
      // });

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert('¡Préstamo creado exitosamente!');
      navigate('/admin/prestamos');

    } catch (error) {
      alert('Error al crear el préstamo');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const tipoSeleccionado = tiposPrestamo.find(t => t.id === tipoPrestamo);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/prestamos')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Préstamo</h1>
              <p className="text-sm text-gray-600">Genera un préstamo para un socio existente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
          
          {/* Búsqueda y Selección de Socio */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Seleccionar Socio
            </h2>

            {!socioSeleccionado ? (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={busquedaSocio}
                    onChange={(e) => setBusquedaSocio(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscarSocio())}
                    placeholder="Buscar por cédula o nombre..."
                    className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={buscarSocio}
                    disabled={buscandoSocio || busquedaSocio.length < 3}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:bg-gray-300"
                  >
                    {buscandoSocio ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {sociosEncontrados.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
                    {sociosEncontrados.map(socio => (
                      <button
                        key={socio.id}
                        type="button"
                        onClick={() => seleccionarSocio(socio)}
                        className="w-full text-left p-4 hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-semibold text-gray-900">{socio.nombreCompleto}</div>
                        <div className="text-sm text-gray-600">Cédula: {socio.cedula}</div>
                        <div className="text-sm text-gray-600">{socio.email}</div>
                      </button>
                    ))}
                  </div>
                )}

                {errors.socio && <p className="mt-2 text-sm text-red-600">{errors.socio}</p>}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{socioSeleccionado.nombreCompleto}</h3>
                      <p className="text-sm text-gray-600">Cédula: {socioSeleccionado.cedula}</p>
                      <p className="text-sm text-gray-600">{socioSeleccionado.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSocioSeleccionado(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Préstamo */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Tipo de Préstamo
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {tiposPrestamo.map(tipo => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoPrestamo(tipo.id)}
                  className={`border-2 rounded-lg p-4 text-left transition-all ${
                    tipoPrestamo === tipo.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  disabled={isLoading}
                >
                  <h3 className="font-bold text-lg mb-2">{tipo.nombre}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <Percent className="w-4 h-4 mr-2" />
                      {tipo.tasaInteres}% anual
                    </p>
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {tipo.plazoMinimo}-{tipo.plazoMaximo} meses
                    </p>
                    <p className="text-xs mt-2">
                      {formatCurrency(tipo.montoMinimo)} - {formatCurrency(tipo.montoMaximo)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {errors.tipo && <p className="mt-2 text-sm text-red-600">{errors.tipo}</p>}
          </div>

          {/* Detalles del Préstamo */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Detalles del Préstamo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto del Préstamo *
                </label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder={tipoSeleccionado ? `Entre ${formatCurrency(tipoSeleccionado.montoMinimo)} y ${formatCurrency(tipoSeleccionado.montoMaximo)}` : 'Monto'}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.monto ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading || !tipoPrestamo}
                />
                {errors.monto && <p className="mt-1 text-sm text-red-600">{errors.monto}</p>}
              </div>

              {/* Plazo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plazo (meses) *
                </label>
                <input
                  type="number"
                  value={plazo}
                  onChange={(e) => setPlazo(e.target.value)}
                  placeholder={tipoSeleccionado ? `Entre ${tipoSeleccionado.plazoMinimo} y ${tipoSeleccionado.plazoMaximo}` : 'Plazo'}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.plazo ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading || !tipoPrestamo}
                />
                {errors.plazo && <p className="mt-1 text-sm text-red-600">{errors.plazo}</p>}
              </div>

              {/* Fecha de Desembolso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Desembolso *
                </label>
                <input
                  type="date"
                  value={fechaDesembolso}
                  onChange={(e) => setFechaDesembolso(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.fecha ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                />
                {errors.fecha && <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>}
              </div>

              {/* Destino */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino del Préstamo *
                </label>
                <textarea
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Describe para qué se utilizará el préstamo..."
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.destino ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                />
                {errors.destino && <p className="mt-1 text-sm text-red-600">{errors.destino}</p>}
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Notas adicionales sobre el préstamo..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Simulación */}
          {simulacion && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calculator className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold">Simulación del Préstamo</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cuota Mensual</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(simulacion.cuotaMensual)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total a Pagar</p>
                  <p className="text-xl font-bold">{formatCurrency(simulacion.totalPagar)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Intereses</p>
                  <p className="text-lg font-semibold">{formatCurrency(simulacion.totalIntereses)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de Interés</p>
                  <p className="text-lg font-semibold">{simulacion.tasaInteres}% anual</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/prestamos')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Préstamo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoPrestamo;