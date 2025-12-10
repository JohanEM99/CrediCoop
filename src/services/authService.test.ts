import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, logout, getCurrentUser, isAuthenticated, isAdmin, isSocio } from './authService';
import { supabase } from '../lib/supabase';

// Mock de supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('debe retornar error si el usuario no existe', async () => {
      // Simular que no se encuentra el usuario
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const result = await login({
        email: 'noexiste@test.com',
        password: 'test123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales incorrectas');
    });

    it('debe iniciar sesión correctamente con credenciales válidas de admin', async () => {
      const mockUsuario = {
        id: '123',
        email: 'admin@credicoop.com',
        rol: 'ADMIN',
        socio_id: null,
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUsuario, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const result = await login({
        email: 'admin@credicoop.com',
        password: 'admin123',
      });

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('admin@credicoop.com');
      expect(result.user?.rol).toBe('ADMIN');
      expect(localStorage.getItem('user')).toBeTruthy();
    });

    it('debe iniciar sesión correctamente con credenciales válidas de socio', async () => {
      const mockUsuario = {
        id: '456',
        email: 'socio@credicoop.com',
        rol: 'SOCIO',
        socio_id: 'socio-123',
      };

      const mockSocio = {
        nombre: 'Juan',
        apellido: 'Pérez',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'usuarios') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockUsuario, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        if (table === 'socios') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockSocio, error: null }),
              }),
            }),
          };
        }
      });

      const result = await login({
        email: 'socio@credicoop.com',
        password: 'socio123',
      });

      expect(result.success).toBe(true);
      expect(result.user?.nombre).toBe('Juan Pérez');
      expect(result.user?.rol).toBe('SOCIO');
    });

    it('debe retornar error con contraseña incorrecta', async () => {
      const mockUsuario = {
        id: '123',
        email: 'admin@credicoop.com',
        rol: 'ADMIN',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUsuario, error: null }),
          }),
        }),
      });

      const result = await login({
        email: 'admin@credicoop.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciales incorrectas');
    });
  });

  describe('logout', () => {
    it('debe limpiar el localStorage al cerrar sesión', () => {
      localStorage.setItem('user', JSON.stringify({ id: '123', email: 'test@test.com' }));
      
      logout();
      
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('debe retornar null si no hay usuario en localStorage', () => {
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('debe retornar el usuario si existe en localStorage', () => {
      const mockUser = { id: '123', email: 'test@test.com', rol: 'ADMIN', nombre: 'Test' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const user = getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('debe retornar null si el JSON en localStorage es inválido', () => {
      localStorage.setItem('user', 'invalid-json');
      
      const user = getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('debe retornar false si no hay usuario', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('debe retornar true si hay usuario en localStorage', () => {
      localStorage.setItem('user', JSON.stringify({ id: '123', email: 'test@test.com' }));
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('isAdmin', () => {
    it('debe retornar true si el usuario es ADMIN', () => {
      localStorage.setItem('user', JSON.stringify({ id: '123', rol: 'ADMIN' }));
      expect(isAdmin()).toBe(true);
    });

    it('debe retornar false si el usuario no es ADMIN', () => {
      localStorage.setItem('user', JSON.stringify({ id: '123', rol: 'SOCIO' }));
      expect(isAdmin()).toBe(false);
    });

    it('debe retornar false si no hay usuario', () => {
      expect(isAdmin()).toBe(false);
    });
  });

  describe('isSocio', () => {
    it('debe retornar true si el usuario es SOCIO', () => {
      localStorage.setItem('user', JSON.stringify({ id: '123', rol: 'SOCIO' }));
      expect(isSocio()).toBe(true);
    });

    it('debe retornar false si el usuario no es SOCIO', () => {
      localStorage.setItem('user', JSON.stringify({ id: '123', rol: 'ADMIN' }));
      expect(isSocio()).toBe(false);
    });

    it('debe retornar false si no hay usuario', () => {
      expect(isSocio()).toBe(false);
    });
  });
});