import { supabase } from '../lib/supabase'

// =====================================================
// TIPOS Y INTERFACES
// =====================================================

export interface CrearSocioData {
  cedula: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  ocupacion?: string
}

export interface Socio {
  id: string
  cedula: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  fecha_nacimiento: string
  ocupacion?: string
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  created_at?: string
  updated_at?: string
}

export interface SocioResponse {
  success: boolean
  socio?: Socio
  error?: string
}

// =====================================================
// FUNCIONES CRUD DE SOCIOS
// =====================================================

/**
 * Crear un nuevo socio y su usuario
 */
export const crearSocio = async (data: CrearSocioData): Promise<SocioResponse> => {
  try {
    console.log('📝 Creando socio:', data)

    // 1. Verificar que no exista la cédula
    const { data: cedulaExistente } = await supabase
      .from('socios')
      .select('id')
      .eq('cedula', data.cedula)
      .single()

    if (cedulaExistente) {
      return {
        success: false,
        error: 'Ya existe un socio con esta cédula'
      }
    }

    // 2. Verificar que no exista el email
    const { data: emailExistente } = await supabase
      .from('socios')
      .select('id')
      .eq('email', data.email)
      .single()

    if (emailExistente) {
      return {
        success: false,
        error: 'Ya existe un socio con este correo electrónico'
      }
    }

    // 3. Insertar el socio
    const { data: socio, error: socioError } = await supabase
      .from('socios')
      .insert({
        cedula: data.cedula,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        fecha_nacimiento: data.fecha_nacimiento,
        ocupacion: data.ocupacion || null,
        estado: 'ACTIVO'
      })
      .select()
      .single()

    if (socioError) {
      console.error('❌ Error al crear socio:', socioError)
      return {
        success: false,
        error: socioError.message
      }
    }

    // 4. Crear usuario con contraseña temporal (cédula)
    const passwordTemporal = data.cedula // Usa la cédula como password temporal

    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        socio_id: socio.id,
        email: data.email,
        password_hash: passwordTemporal, // En producción debe estar hasheado
        rol: 'SOCIO'
      })

    if (usuarioError) {
      console.error('❌ Error al crear usuario:', usuarioError)
      
      // Rollback: eliminar el socio si no se pudo crear el usuario
      await supabase
        .from('socios')
        .delete()
        .eq('id', socio.id)

      return {
        success: false,
        error: 'Error al crear el usuario. Por favor intenta de nuevo.'
      }
    }

    console.log('✅ Socio y usuario creados exitosamente')

    return {
      success: true,
      socio: socio
    }

  } catch (error) {
    console.error('💥 Error inesperado:', error)
    return {
      success: false,
      error: 'Error al crear el socio'
    }
  }
}

/**
 * Obtener todos los socios
 */
export const obtenerSocios = async (): Promise<Socio[]> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener socios:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error inesperado:', error)
    return []
  }
}

/**
 * Obtener un socio por ID
 */
export const obtenerSocioPorId = async (id: string): Promise<Socio | null> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error al obtener socio:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error inesperado:', error)
    return null
  }
}

/**
 * Actualizar un socio
 */
export const actualizarSocio = async (id: string, data: Partial<CrearSocioData>): Promise<SocioResponse> => {
  try {
    const { data: socio, error } = await supabase
      .from('socios')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      socio: socio
    }
  } catch (error) {
    console.error('Error al actualizar socio:', error)
    return {
      success: false,
      error: 'Error al actualizar el socio'
    }
  }
}

/**
 * Cambiar estado de un socio
 */
export const cambiarEstadoSocio = async (
  id: string, 
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
): Promise<SocioResponse> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      socio: data
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error al cambiar estado del socio'
    }
  }
}

/**
 * Buscar socios por término
 */
export const buscarSocios = async (termino: string): Promise<Socio[]> => {
  try {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .or(`nombre.ilike.%${termino}%,apellido.ilike.%${termino}%,cedula.ilike.%${termino}%,email.ilike.%${termino}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al buscar socios:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error inesperado:', error)
    return []
  }
}