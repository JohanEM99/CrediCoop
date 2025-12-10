import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, CreditCard, Calendar } from 'lucide-react';

interface SocioData {
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  ocupacion: string;
  estado: 'activo' | 'inactivo';
}

const EditarSocio = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<SocioData>({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    ocupacion: '',
    estado: 'activo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    // Verificar autenticación
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

    cargarDatosSocio();
  }, [navigate, id]);

  const cargarDatosSocio = async () => {
    try {
      setCargandoDatos(true);
      
      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch(`/api/socios/${id}`);
      // const data = await response.json();
      // setFormData(data);

      // Datos de ejemplo (remover cuando conectes al backend)
      const socioEjemplo: SocioData = {
        cedula: '1234567890',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@email.com',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67',
        fechaNacimiento: '1985-05-15',
        ocupacion: 'Ingeniero',
        estado: 'activo'
      };
      
      setFormData(socioEjemplo);
    } catch (error) {
      console.error('Error al cargar datos del socio:', error);
      alert('Error al cargar los datos del socio');
      navigate('/admin/socios');
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cedula) newErrors.cedula = 'La cédula es obligatoria';
    else if (formData.cedula.length < 6) newErrors.cedula = 'Cédula inválida';

    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.apellido) newErrors.apellido = 'El apellido es obligatorio';

    if (!formData.email) newErrors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }

    if (!formData.telefono) newErrors.telefono = 'El teléfono es obligatorio';
    else if (formData.telefono.length < 10) newErrors.telefono = 'Teléfono inválido';

    if (!formData.direccion) newErrors.direccion = 'La dirección es obligatoria';
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsLoading(true);

      // TODO: Reemplazar con llamada real al backend
      // await fetch(`/api/socios/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Datos actualizados:', formData);
      alert('¡Socio actualizado exitosamente!');
      navigate('/admin/socios');

    } catch (error) {
      alert('Error al actualizar el socio');
    } finally {
      setIsLoading(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del socio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/socios')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Socio</h1>
              <p className="text-sm text-gray-600">Actualiza la información del socio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
          
          {/* Estado del socio */}
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Socio
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Los socios inactivos no pueden solicitar nuevos préstamos
            </p>
          </div>

          {/* Información Personal */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información Personal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cédula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      errors.cedula ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100`}
                    disabled={true} // La cédula no debería cambiar
                  />
                </div>
                {errors.cedula && <p className="mt-1 text-sm text-red-600">{errors.cedula}</p>}
                <p className="mt-1 text-xs text-gray-500">La cédula no puede modificarse</p>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.apellido ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isLoading}
                />
                {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={isLoading}
                  />
                </div>
                {errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>}
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Información de Contacto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      errors.telefono ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={isLoading}
                  />
                </div>
                {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      errors.direccion ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled={isLoading}
                  />
                </div>
                {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
              </div>

              {/* Ocupación */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupación
                </label>
                <input
                  type="text"
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/socios')}
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
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarSocio;