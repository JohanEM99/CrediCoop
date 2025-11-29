import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Upload, FileText, CheckCircle, AlertCircle, DollarSign, Calendar, Percent, ArrowLeft } from 'lucide-react';

// Tipos de datos
interface TipoPrestamo {
  id: string;
  nombre: string;
  tasaInteres: number;
  plazoMinimo: number;
  plazoMaximo: number;
  montoMinimo: number;
  montoMaximo: number;
  requisitos: string[];
}

interface DocumentoRequerido {
  id: string;
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
  archivo?: File;
}

interface SimulacionPrestamo {
  montoSolicitado: number;
  plazoMeses: number;
  tasaInteres: number;
  cuotaMensual: number;
  totalIntereses: number;
  totalPagar: number;
}

const SolicitarPrestamo: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [paso, setPaso] = useState(1);
  const [tipoPrestamo, setTipoPrestamo] = useState<TipoPrestamo | null>(null);
  const [monto, setMonto] = useState('');
  const [plazo, setPlazo] = useState('');
  const [destino, setDestino] = useState('');
  const [ingresoMensual, setIngresoMensual] = useState('');
  const [egresoMensual, setEgresoMensual] = useState('');
  const [simulacion, setSimulacion] = useState<SimulacionPrestamo | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoRequerido[]>([]);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [solicitudExitosa, setSolicitudExitosa] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.rol !== 'SOCIO') {
      navigate('/login');
    }
  }, [navigate]);

  // Tipos de préstamo disponibles (esto vendría del backend)
  const tiposPrestamo: TipoPrestamo[] = [
    {
      id: '1',
      nombre: 'Préstamo Personal',
      tasaInteres: 12.5,
      plazoMinimo: 6,
      plazoMaximo: 60,
      montoMinimo: 1000000,
      montoMaximo: 50000000,
      requisitos: [
        'Antigüedad mínima de 6 meses como socio',
        'Comprobante de ingresos',
        'Identificación oficial vigente',
        'Comprobante de domicilio'
      ]
    },
    {
      id: '2',
      nombre: 'Préstamo Hipotecario',
      tasaInteres: 9.8,
      plazoMinimo: 60,
      plazoMaximo: 240,
      montoMinimo: 50000000,
      montoMaximo: 500000000,
      requisitos: [
        'Antigüedad mínima de 1 año como socio',
        'Avalúo de la propiedad',
        'Escrituras del inmueble',
        'Comprobante de ingresos de los últimos 3 meses',
        'Identificación oficial vigente'
      ]
    },
    {
      id: '3',
      nombre: 'Préstamo Vehicular',
      tasaInteres: 11.2,
      plazoMinimo: 12,
      plazoMaximo: 72,
      montoMinimo: 5000000,
      montoMaximo: 100000000,
      requisitos: [
        'Antigüedad mínima de 6 meses como socio',
        'Factura del vehículo',
        'Seguro de auto',
        'Comprobante de ingresos',
        'Identificación oficial vigente'
      ]
    }
  ];

  // Calcular simulación
  useEffect(() => {
    if (tipoPrestamo && monto && plazo) {
      const m = parseFloat(monto);
      const p = parseInt(plazo);
      const r = tipoPrestamo.tasaInteres / 100 / 12;

      if (m > 0 && p > 0) {
        const cuota = (m * r * Math.pow(1 + r, p)) / (Math.pow(1 + r, p) - 1);
        const totalPagar = cuota * p;
        const totalIntereses = totalPagar - m;

        setSimulacion({
          montoSolicitado: m,
          plazoMeses: p,
          tasaInteres: tipoPrestamo.tasaInteres,
          cuotaMensual: cuota,
          totalIntereses: totalIntereses,
          totalPagar: totalPagar
        });
      }
    }
  }, [monto, plazo, tipoPrestamo]);

  // Configurar documentos requeridos según tipo de préstamo
  useEffect(() => {
    if (tipoPrestamo) {
      const docsBase: DocumentoRequerido[] = [
        { id: '1', nombre: 'Identificación Oficial', descripcion: 'INE, Pasaporte o Cédula Profesional', obligatorio: true },
        { id: '2', nombre: 'Comprobante de Domicilio', descripcion: 'No mayor a 3 meses', obligatorio: true },
        { id: '3', nombre: 'Comprobante de Ingresos', descripcion: 'Últimos 3 recibos de nómina o estados de cuenta', obligatorio: true }
      ];

      if (tipoPrestamo.id === '2') {
        docsBase.push(
          { id: '4', nombre: 'Avalúo de Propiedad', descripcion: 'Avalúo certificado no mayor a 6 meses', obligatorio: true },
          { id: '5', nombre: 'Escrituras', descripcion: 'Copia de escrituras del inmueble', obligatorio: true }
        );
      } else if (tipoPrestamo.id === '3') {
        docsBase.push(
          { id: '4', nombre: 'Factura del Vehículo', descripcion: 'Factura original o carta factura', obligatorio: true },
          { id: '5', nombre: 'Póliza de Seguro', descripcion: 'Seguro de auto vigente', obligatorio: true }
        );
      }

      setDocumentos(docsBase);
    }
  }, [tipoPrestamo]);

  const handleArchivoChange = (docId: string, file: File | null) => {
    setDocumentos(docs =>
      docs.map(doc =>
        doc.id === docId ? { ...doc, archivo: file || undefined } : doc
      )
    );
  };

  const validarPaso = (): boolean => {
    switch (paso) {
      case 1:
        return tipoPrestamo !== null;
      case 2:
        const m = parseFloat(monto);
        const p = parseInt(plazo);
        return (
          m >= (tipoPrestamo?.montoMinimo || 0) &&
          m <= (tipoPrestamo?.montoMaximo || 0) &&
          p >= (tipoPrestamo?.plazoMinimo || 0) &&
          p <= (tipoPrestamo?.plazoMaximo || 0) &&
          destino.length > 10
        );
      case 3:
        const ingreso = parseFloat(ingresoMensual);
        const egreso = parseFloat(egresoMensual);
        return ingreso > 0 && egreso >= 0 && egreso < ingreso;
      case 4:
        return documentos
          .filter(d => d.obligatorio)
          .every(d => d.archivo);
      case 5:
        return aceptaTerminos;
      default:
        return false;
    }
  };

  const avanzarPaso = () => {
    if (validarPaso()) {
      setPaso(paso + 1);
    }
  };

  const handleEnviarSolicitud = async () => {
    if (!validarPaso()) return;

    setEnviando(true);
    
    try {
      // TODO: Implementar llamada al backend
      // const formData = new FormData();
      // formData.append('tipoPrestamo', tipoPrestamo.id);
      // formData.append('monto', monto);
      // ... agregar todos los campos
      
      // const response = await fetch('/api/solicitudes', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSolicitudExitosa(true);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Error al enviar la solicitud. Por favor intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Componente de progreso
  const ProgresoSolicitud = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {['Tipo', 'Monto', 'Capacidad', 'Documentos', 'Confirmar'].map((label, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              paso > index + 1 ? 'bg-green-500 text-white' :
              paso === index + 1 ? 'bg-blue-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {paso > index + 1 ? '✓' : index + 1}
            </div>
            <span className="text-xs mt-2 text-gray-600">{label}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(paso / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (solicitudExitosa) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Solicitud Enviada Exitosamente!</h2>
            <p className="text-gray-600 mb-4">Tu solicitud de préstamo ha sido recibida y está en proceso de revisión.</p>
            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Número de Solicitud</p>
              <p className="text-2xl font-bold text-blue-600">SOL-2024-{Math.floor(Math.random() * 10000).toString().padStart(5, '0')}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Recibirás una notificación por correo electrónico cuando tu solicitud sea revisada.
              El proceso puede tomar de 2 a 5 días hábiles.
            </p>
            <button
              onClick={() => navigate('/socio/mis-prestamos')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Volver a Mis Préstamos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/socio/mis-prestamos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Mis Préstamos
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Solicitud de Préstamo</h1>
          
          <ProgresoSolicitud />

          {/* Paso 1: Selección de tipo de préstamo */}
          {paso === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Selecciona el tipo de préstamo</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {tiposPrestamo.map(tipo => (
                  <div
                    key={tipo.id}
                    onClick={() => setTipoPrestamo(tipo)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      tipoPrestamo?.id === tipo.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-bold text-lg mb-2">{tipo.nombre}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center">
                        <Percent className="w-4 h-4 mr-2" />
                        Tasa: {tipo.tasaInteres}% anual
                      </p>
                      <p className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Plazo: {tipo.plazoMinimo}-{tipo.plazoMaximo} meses
                      </p>
                      <p className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {formatCurrency(tipo.montoMinimo)} - {formatCurrency(tipo.montoMaximo)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {tipoPrestamo && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Requisitos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {tipoPrestamo.requisitos.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Monto y plazo */}
          {paso === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Detalles del préstamo</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monto a solicitar</label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder={`Entre ${formatCurrency(tipoPrestamo?.montoMinimo || 0)} y ${formatCurrency(tipoPrestamo?.montoMaximo || 0)}`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Plazo (meses)</label>
                  <input
                    type="number"
                    value={plazo}
                    onChange={(e) => setPlazo(e.target.value)}
                    placeholder={`Entre ${tipoPrestamo?.plazoMinimo} y ${tipoPrestamo?.plazoMaximo} meses`}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Destino del préstamo</label>
                  <textarea
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Describe para qué utilizarás el préstamo (mínimo 10 caracteres)"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {simulacion && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Calculator className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-bold">Simulación de tu préstamo</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Cuota mensual</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(simulacion.cuotaMensual)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total a pagar</p>
                      <p className="text-xl font-bold">{formatCurrency(simulacion.totalPagar)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total intereses</p>
                      <p className="text-lg font-semibold">{formatCurrency(simulacion.totalIntereses)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tasa de interés</p>
                      <p className="text-lg font-semibold">{simulacion.tasaInteres}% anual</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Capacidad de pago */}
          {paso === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Capacidad de pago</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ingreso mensual</label>
                  <input
                    type="number"
                    value={ingresoMensual}
                    onChange={(e) => setIngresoMensual(e.target.value)}
                    placeholder="Tus ingresos mensuales totales"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Egreso mensual (gastos fijos)</label>
                  <input
                    type="number"
                    value={egresoMensual}
                    onChange={(e) => setEgresoMensual(e.target.value)}
                    placeholder="Tus gastos mensuales aproximados"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {ingresoMensual && egresoMensual && simulacion && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Análisis de capacidad de pago</h4>
                  {(() => {
                    const ingreso = parseFloat(ingresoMensual);
                    const egreso = parseFloat(egresoMensual);
                    const disponible = ingreso - egreso;
                    const porcentajeCuota = (simulacion.cuotaMensual / ingreso) * 100;
                    
                    return (
                      <div className="space-y-2 text-sm">
                        <p>Ingreso disponible: <span className="font-bold">{formatCurrency(disponible)}</span></p>
                        <p>Cuota representa: <span className="font-bold">{porcentajeCuota.toFixed(1)}%</span> de tus ingresos</p>
                        {porcentajeCuota > 40 ? (
                          <div className="flex items-start mt-2 text-red-700">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            <p>La cuota supera el 40% de tus ingresos. Esto podría dificultar el pago. Te recomendamos reducir el monto o aumentar el plazo.</p>
                          </div>
                        ) : (
                          <div className="flex items-start mt-2 text-green-700">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            <p>Tu capacidad de pago es adecuada para este préstamo.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Documentos */}
          {paso === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Documentación requerida</h2>
              <div className="space-y-4">
                {documentos.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center">
                          {doc.nombre}
                          {doc.obligatorio && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{doc.descripcion}</p>
                      </div>
                      <div className="ml-4">
                        {doc.archivo ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            <span className="text-sm">Cargado</span>
                          </div>
                        ) : (
                          <Upload className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleArchivoChange(doc.id, e.target.files?.[0] || null)}
                      className="mt-3 text-sm"
                    />
                    {doc.archivo && (
                      <p className="text-xs text-gray-500 mt-1">
                        {doc.archivo.name} ({(doc.archivo.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">* Documentos obligatorios</p>
            </div>
          )}

          {/* Paso 5: Confirmación */}
          {paso === 5 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Resumen de tu solicitud</h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tipo de préstamo</p>
                    <p className="font-semibold">{tipoPrestamo?.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monto solicitado</p>
                    <p className="font-semibold">{formatCurrency(parseFloat(monto))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plazo</p>
                    <p className="font-semibold">{plazo} meses</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cuota mensual</p>
                    <p className="font-semibold text-blue-600">{simulacion && formatCurrency(simulacion.cuotaMensual)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasa de interés</p>
                    <p className="font-semibold">{tipoPrestamo?.tasaInteres}% anual</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total a pagar</p>
                    <p className="font-semibold">{simulacion && formatCurrency(simulacion.totalPagar)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destino</p>
                  <p className="font-semibold">{destino}</p>
                </div>
              </div>

              <div className="mt-6 border border-gray-300 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    Acepto los términos y condiciones del préstamo. Declaro que la información proporcionada es verídica
                    y autorizo a la cooperativa a verificar mis datos. Entiendo que la aprobación está sujeta a evaluación crediticia.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {paso > 1 && (
              <button
                onClick={() => setPaso(paso - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Atrás
              </button>
            )}
            {paso < 5 ? (
              <button
                onClick={avanzarPaso}
                disabled={!validarPaso()}
                className={`ml-auto px-6 py-2 rounded-lg ${
                  validarPaso()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleEnviarSolicitud}
                disabled={!validarPaso() || enviando}
                className={`ml-auto px-6 py-2 rounded-lg ${
                  validarPaso() && !enviando
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {enviando ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitarPrestamo;