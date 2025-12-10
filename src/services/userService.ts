import { supabase } from '../lib/supabase'

// =====================================================
// TIPOS Y INTERFACES
// =====================================================

export interface UsuarioListado {
  id: string
  email: string
  rol: 'ADMIN' | 'SOCIO'
  estado: 'ACTIVO' | 'INACTIVO'
  ultimo_acceso: string | null
  fecha_creacion: string
  socio_id?: string
  socio?: {
    nombre: string
    apellido: string
    telefono?: string
    direccion?: string
  }
}

export interface UsuariosResponse {
  success: boolean
  usuarios?: UsuarioListado[]
  error?: string
}

export interface CrearUsuarioData {
  email: string
  password: string
  rol: 'ADMIN' | 'SOCIO'
  socio_id?: string
}

// =====================================================
// FUNCIONES DE GESTIÓN DE USUARIOS
// =====================================================

/**
 * Obtener todos los usuarios con información de socio
 */
export const obtenerUsuarios = async (): Promise<UsuariosResponse> => {
  try {
    console.log('🔍 Obteniendo lista de usuarios...')

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        socios:socio_id (
          nombre,
          apellido,
          telefono,
          direccion
        )
      `)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener usuarios:', error)
      return {
        success: false,
        error: 'Error al cargar los usuarios'
      }
    }

    // Transformar datos para que coincidan con la interfaz
    const usuariosTransformados: UsuarioListado[] = usuarios.map((usuario: any) => ({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      ultimo_acceso: usuario.ultimo_acceso,
      fecha_creacion: usuario.fecha_creacion,
      socio_id: usuario.socio_id,
      socio: usuario.socios ? {
        nombre: usuario.socios.nombre,
        apellido: usuario.socios.apellido,
        telefono: usuario.socios.telefono,
        direccion: usuario.socios.direccion
      } : undefined
    }))

    console.log('✅ Usuarios obtenidos:', usuariosTransformados.length)

    return {
      success: true,
      usuarios: usuariosTransformados
    }

  } catch (error) {
    console.error('💥 Error al obtener usuarios:', error)
    return {
      success: false,
      error: 'Error de conexión'
    }
  }
}

/**
 * Obtener usuario por ID
 */
export const obtenerUsuarioPorId = async (id: string): Promise<UsuariosResponse> => {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        socios:socio_id (
          nombre,
          apellido,
          telefono,
          direccion
        )
      `)
      .eq('id', id)
      .single()

    if (error || !usuario) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      }
    }

    const usuarioTransformado: UsuarioListado = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado,
      ultimo_acceso: usuario.ultimo_acceso,
      fecha_creacion: usuario.fecha_creacion,
      socio_id: usuario.socio_id,
      socio: usuario.socios ? {
        nombre: usuario.socios.nombre,
        apellido: usuario.socios.apellido,
        telefono: usuario.socios.telefono,
        direccion: usuario.socios.direccion
      } : undefined
    }

    return {
      success: true,
      usuarios: [usuarioTransformado]
    }

  } catch (error) {
    return {
      success: false,
      error: 'Error al obtener usuario'
    }
  }
}

/**
 * Cambiar estado de usuario (ACTIVO/INACTIVO)
 */
export const cambiarEstadoUsuario = async (
  id: string, 
  nuevoEstado: 'ACTIVO' | 'INACTIVO'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: 'Error al cambiar estado del usuario'
      }
    }

    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: 'Error de conexión'
    }
  }
}

/**
 * Eliminar usuario
 */
export const eliminarUsuario = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: 'Error al eliminar usuario'
      }
    }

    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: 'Error de conexión'
    }
  }
}