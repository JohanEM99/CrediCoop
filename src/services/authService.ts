import { supabase } from '../lib/supabase'

// =====================================================
// TIPOS Y INTERFACES
// =====================================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface Usuario {
  id: string
  email: string
  rol: string
  nombre: string
  socio_id?: string
}

export interface AuthResponse {
  success: boolean
  user?: Usuario
  error?: string
}

// =====================================================
// FUNCIONES DE AUTENTICACIÓN
// =====================================================

/**
 * Iniciar sesión con email y contraseña
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('🔍 Intentando login con:', credentials.email)

    // Buscar el usuario en la tabla usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', credentials.email)
      .single()

    console.log('📊 Resultado de búsqueda:', { usuario, usuarioError })

    if (usuarioError || !usuario) {
      console.error('❌ Usuario no encontrado:', usuarioError)
      return {
        success: false,
        error: 'Credenciales incorrectas'
      }
    }

    // Validar contraseña
    const isValidPassword = validatePassword(credentials.email, credentials.password)

    console.log('🔐 Validación de contraseña:', isValidPassword)

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Credenciales incorrectas'
      }
    }

    // Buscar información del socio si existe
    let nombreUsuario = 'Usuario'
    if (usuario.socio_id) {
      const { data: socio } = await supabase
        .from('socios')
        .select('nombre, apellido')
        .eq('id', usuario.socio_id)
        .single()

      if (socio) {
        nombreUsuario = `${socio.nombre} ${socio.apellido}`
      }
    } else {
      nombreUsuario = usuario.email.split('@')[0]
    }

    // Actualizar último acceso
    await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', usuario.id)

    // Preparar datos del usuario
    const userData: Usuario = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: nombreUsuario,
      socio_id: usuario.socio_id
    }

    console.log('✅ Login exitoso:', userData)

    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(userData))

    return {
      success: true,
      user: userData
    }

  } catch (error) {
    console.error('💥 Error en login:', error)
    return {
      success: false,
      error: 'Error al iniciar sesión'
    }
  }
}

/**
 * Validar contraseña (temporal - usuarios de prueba)
 * En producción, esto debe comparar con password_hash usando bcrypt
 */
const validatePassword = (email: string, password: string): boolean => {
  // Usuarios de prueba hardcodeados
  const testUsers: Record<string, string> = {
    'admin@credicoop.com': 'admin123',
    'socio@credicoop.com': 'socio123'
  }

  return testUsers[email] === password
}

/**
 * Cerrar sesión
 */
export const logout = (): void => {
  localStorage.removeItem('user')
}

/**
 * Obtener usuario actual
 */
export const getCurrentUser = (): Usuario | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

/**
 * Verificar si el usuario es admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser()
  return user?.rol === 'ADMIN'
}

/**
 * Verificar si el usuario es socio
 */
export const isSocio = (): boolean => {
  const user = getCurrentUser()
  return user?.rol === 'SOCIO'
}