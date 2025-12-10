import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Shield, 
  User,
  Clock,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { obtenerUsuarios, cambiarEstadoUsuario, type UsuarioListado } from '../../services/userService'

const ListaUsuarios = () => {
  // ============================================
  // ESTADO
  // ============================================
  const [usuarios, setUsuarios] = useState<UsuarioListado[]>([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<UsuarioListado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroRol, setFiltroRol] = useState<'TODOS' | 'ADMIN' | 'SOCIO'>('TODOS')
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS')

  // ============================================
  // CARGAR USUARIOS
  // ============================================
  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setIsLoading(true)
    setError('')
    
    const response = await obtenerUsuarios()
    
    if (response.success && response.usuarios) {
      setUsuarios(response.usuarios)
      setUsuariosFiltrados(response.usuarios)
    } else {
      setError(response.error || 'Error al cargar usuarios')
    }
    
    setIsLoading(false)
  }

  // ============================================
  // FILTRAR USUARIOS
  // ============================================
  useEffect(() => {
    let resultado = [...usuarios]

    // Filtrar por búsqueda
    if (searchTerm) {
      resultado = resultado.filter(usuario => {
        const terminoBusqueda = searchTerm.toLowerCase()
        const emailMatch = usuario.email.toLowerCase().includes(terminoBusqueda)
        const nombreMatch = usuario.socio 
          ? `${usuario.socio.nombre} ${usuario.socio.apellido}`.toLowerCase().includes(terminoBusqueda)
          : false
        return emailMatch || nombreMatch
      })
    }

    // Filtrar por rol
    if (filtroRol !== 'TODOS') {
      resultado = resultado.filter(usuario => usuario.rol === filtroRol)
    }

    // Filtrar por estado
    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter(usuario => usuario.estado === filtroEstado)
    }

    setUsuariosFiltrados(resultado)
  }, [searchTerm, filtroRol, filtroEstado, usuarios])

  // ============================================
  // CAMBIAR ESTADO
  // ============================================
  const handleCambiarEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    
    const response = await cambiarEstadoUsuario(id, nuevoEstado)
    
    if (response.success) {
      setSuccessMessage(`Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`)
      setTimeout(() => setSuccessMessage(''), 3000)
      cargarUsuarios()
    } else {
      setError(response.error || 'Error al cambiar estado')
      setTimeout(() => setError(''), 3000)
    }
  }

  // ============================================
  // FORMATEAR FECHA
  // ============================================
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca'
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  const stats = {
    total: usuarios.length,
    admins: usuarios.filter(u => u.rol === 'ADMIN').length,
    socios: usuarios.filter(u => u.rol === 'SOCIO').length,
    activos: usuarios.filter(u => u.estado === 'ACTIVO').length,
    inactivos: usuarios.filter(u => u.estado === 'INACTIVO').length
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          </div>
          <p className="text-gray-600">Administra los usuarios del sistema</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Socios</p>
                <p className="text-2xl font-bold text-blue-600">{stats.socios}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactivos}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Rol */}
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="ADMIN">Solo Admins</option>
              <option value="SOCIO">Solo Socios</option>
            </select>

            {/* Filtro por Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Solo Activos</option>
              <option value="INACTIVO">Solo Inactivos</option>
            </select>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Cargando usuarios...</span>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Acceso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                      {/* Usuario */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            usuario.rol === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            {usuario.rol === 'ADMIN' ? (
                              <Shield className="w-5 h-5 text-purple-600" />
                            ) : (
                              <User className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.socio 
                                ? `${usuario.socio.nombre} ${usuario.socio.apellido}`
                                : usuario.email.split('@')[0]
                              }
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {usuario.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.rol === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {usuario.rol}
                        </span>
                      </td>

                      {/* Contacto */}
                      <td className="px-6 py-4">
                        {usuario.socio ? (
                          <div className="text-sm">
                            {usuario.socio.telefono && (
                              <div className="flex items-center text-gray-900">
                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                {usuario.socio.telefono}
                              </div>
                            )}
                            {usuario.socio.direccion && (
                              <div className="flex items-center text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {usuario.socio.direccion.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin datos</span>
                        )}
                      </td>

                      {/* Último Acceso */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {formatearFecha(usuario.ultimo_acceso)}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.estado === 'ACTIVO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.estado === 'ACTIVO' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {usuario.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleCambiarEstado(usuario.id, usuario.estado)}
                          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                            usuario.estado === 'ACTIVO'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {usuario.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen de filtros */}
        {usuariosFiltrados.length !== usuarios.length && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        )}
      </div>
    </div>
  )
}

export default ListaUsuarios