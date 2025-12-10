import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Edit, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import { obtenerSocios, buscarSocios, eliminarSocio } from '../../services/sociosService';

interface Socio {
    id: string;
    cedula: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    fecha_nacimiento: string;
    ocupacion?: string;
    estado: 'ACTIVO' | 'INACTIVO';
    created_at?: string;
}

const ListaSocios = () => {
    const navigate = useNavigate();
    const [socios, setSocios] = useState<Socio[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    const [socioAEliminar, setSocioAEliminar] = useState<Socio | null>(null);

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

        cargarSocios();
    }, [navigate]);

    const cargarSocios = async () => {
        try {
            setCargando(true);

            if (busqueda.trim() !== '') {
                const resultados = await buscarSocios(busqueda);
                setSocios(resultados);
                return;
            }
            const data = await obtenerSocios();
            setSocios(data);

        } catch (error) {
            console.error('Error al cargar socios:', error);
            alert('Error al cargar la lista de socios');
        } finally {
            setCargando(false);
        }
    };
    useEffect(() => {
        cargarSocios();
    }, [busqueda]);


    const handleEliminar = async (socio: Socio) => {
        try {
            const response = await eliminarSocio(socio.id);

            if (!response.success) {
                alert("Error: " + response.error);
                return;
            }

            // Remover del estado si todo sale bien
            setSocios(socios.filter(s => s.id !== socio.id));
            setSocioAEliminar(null);
            alert("Socio eliminado exitosamente");
        } catch (error) {
            console.error("Error al eliminar socio:", error);
            alert("Error inesperado al eliminar el socio");
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando socios...</p>
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
                            <h1 className="text-2xl font-bold text-gray-900">Gestión de Socios</h1>
                            <p className="text-sm text-gray-600">Administra la información de los socios</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/socios/nuevo')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Nuevo Socio
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Barra de búsqueda */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por cédula, nombre, email o teléfono..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Tabla de socios */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {socios.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {busqueda ? 'No se encontraron resultados' : 'No hay socios registrados'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {busqueda
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Comienza agregando tu primer socio'
                                }
                            </p>
                            {!busqueda && (
                                <button
                                    onClick={() => navigate('/admin/socios/nuevo')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Crear Primer Socio
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cédula
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombre Completo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teléfono
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
                                    {socios.map((socio) => (
                                        <tr key={socio.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {socio.cedula}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {socio.nombre} {socio.apellido}
                                                </div>
                                                {socio.ocupacion && (
                                                    <div className="text-sm text-gray-500">{socio.ocupacion}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {socio.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {socio.telefono}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${socio.estado === 'ACTIVO'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {socio.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        onClick={() => navigate(`/admin/socios/${socio.id}/editar`)}
                                                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSocioAEliminar(socio)}
                                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
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
                {socios.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        Mostrando {socios.length} de {socios.length} socios
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            {socioAEliminar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    ¿Eliminar socio?
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Estás a punto de eliminar a <strong>{socioAEliminar.nombre} {socioAEliminar.apellido}</strong>.
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-yellow-800">
                                <strong>Advertencia:</strong> Si este socio tiene préstamos activos, no podrá ser eliminado.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSocioAEliminar(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleEliminar(socioAEliminar)}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaSocios;