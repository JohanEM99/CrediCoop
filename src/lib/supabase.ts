import { createClient } from '@supabase/supabase-js'

// =====================================================
// CONFIGURACIÓN DE SUPABASE
// =====================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =====================================================
// TIPOS DE LA BASE DE DATOS
// =====================================================

export interface Usuario {
  id: string
  email: string
  password_hash: string
  rol: 'ADMIN' | 'SOCIO'
  socio_id?: string
  ultimo_acceso?: string
  created_at?: string
  updated_at?: string
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