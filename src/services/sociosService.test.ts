import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  crearSocio,
  obtenerSocios,
  obtenerSocioPorId,
  actualizarSocio,
  cambiarEstadoSocio,
  buscarSocios,
  eliminarSocio,
} from './sociosService';
import { supabase } from '../lib/supabase';

// Mock de supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('SociosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crearSocio', () => {
    it('debe crear un socio exitosamente', async () => {
      const nuevoSocio = {
        cedula: '1234567890',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        telefono: '3001234567',
        direccion: 'Calle 123',
        fecha_nacimiento: '1990-01-01',
        ocupacion: 'Ingeniero',
      };

      const socioCreado = { id: 'socio-123', ...nuevoSocio, estado: 'ACTIVO' };

      const mockFrom = supabase.from as any;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'socios') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn()
                  .mockResolvedValueOnce({ data: null, error: null }) // Primera verificación: cédula
                  .mockResolvedValueOnce({ data: null, error: null }), // Segunda verificación: email
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: socioCreado, error: null }),
              }),
            }),
          };
        }
        if (table === 'usuarios') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
      });

      const result = await crearSocio(nuevoSocio);

      expect(result.success).toBe(true);
      expect(result.socio?.id).toBe('socio-123');
      expect(result.socio?.nombre).toBe('Juan');
    });

    it('debe retornar error si la cédula ya existe', async () => {
      const nuevoSocio = {
        cedula: '1234567890',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        telefono: '3001234567',
        direccion: 'Calle 123',
        fecha_nacimiento: '1990-01-01',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'existing-id', cedula: '1234567890' },
              error: null,
            }),
          }),
        }),
      });

      const result = await crearSocio(nuevoSocio);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ya existe un socio con esta cédula');
    });

    it('debe retornar error si el email ya existe', async () => {
      const nuevoSocio = {
        cedula: '1234567890',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'existente@test.com',
        telefono: '3001234567',
        direccion: 'Calle 123',
        fecha_nacimiento: '1990-01-01',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn()
              .mockResolvedValueOnce({ data: null, error: null }) // Cédula OK
              .mockResolvedValueOnce({
                data: { id: 'existing-id', email: 'existente@test.com' },
                error: null,
              }), // Email existe
          }),
        }),
      });

      const result = await crearSocio(nuevoSocio);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Ya existe un socio con este correo electrónico');
    });
  });

  describe('obtenerSocios', () => {
    it('debe obtener todos los socios', async () => {
      const mockSocios = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', cedula: '123' },
        { id: '2', nombre: 'María', apellido: 'García', cedula: '456' },
      ];

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockSocios, error: null }),
        }),
      });

      const socios = await obtenerSocios();

      expect(socios).toEqual(mockSocios);
      expect(socios).toHaveLength(2);
    });

    it('debe retornar array vacío en caso de error', async () => {
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
        }),
      });

      const socios = await obtenerSocios();

      expect(socios).toEqual([]);
    });
  });

  describe('obtenerSocioPorId', () => {
    it('debe obtener un socio por su ID', async () => {
      const mockSocio = {
        id: 'socio-123',
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '1234567890',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockSocio, error: null }),
          }),
        }),
      });

      const socio = await obtenerSocioPorId('socio-123');

      expect(socio).toEqual(mockSocio);
    });

    it('debe retornar null si no se encuentra el socio', async () => {
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const socio = await obtenerSocioPorId('no-existe');

      expect(socio).toBeNull();
    });
  });

  describe('actualizarSocio', () => {
    it('debe actualizar un socio exitosamente', async () => {
      const datosActualizados = {
        nombre: 'Juan Actualizado',
        telefono: '3009999999',
      };

      const socioActualizado = {
        id: 'socio-123',
        ...datosActualizados,
        apellido: 'Pérez',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: socioActualizado, error: null }),
            }),
          }),
        }),
      });

      const result = await actualizarSocio('socio-123', datosActualizados);

      expect(result.success).toBe(true);
      expect(result.socio?.nombre).toBe('Juan Actualizado');
    });

    it('debe retornar error si falla la actualización', async () => {
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });

      const result = await actualizarSocio('socio-123', { nombre: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('cambiarEstadoSocio', () => {
    it('debe cambiar el estado de un socio a INACTIVO', async () => {
      const socioModificado = {
        id: 'socio-123',
        nombre: 'Juan',
        estado: 'INACTIVO',
      };

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: socioModificado, error: null }),
            }),
          }),
        }),
      });

      const result = await cambiarEstadoSocio('socio-123', 'INACTIVO');

      expect(result.success).toBe(true);
      expect(result.socio?.estado).toBe('INACTIVO');
    });
  });

  describe('buscarSocios', () => {
    it('debe buscar socios por término', async () => {
      const mockSocios = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', cedula: '123' },
      ];

      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockSocios, error: null }),
          }),
        }),
      });

      const socios = await buscarSocios('Juan');

      expect(socios).toEqual(mockSocios);
      expect(socios).toHaveLength(1);
    });

    it('debe retornar array vacío si no hay coincidencias', async () => {
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const socios = await buscarSocios('NoExiste');

      expect(socios).toEqual([]);
    });
  });

  describe('eliminarSocio', () => {
    it('debe eliminar un socio exitosamente', async () => {
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await eliminarSocio('socio-123');

      expect(result.success).toBe(true);
    });

    it('debe retornar error si falla la eliminación', async () => {
      const mockFrom = supabase.from as any;
      mockFrom.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
        }),
      });

      const result = await eliminarSocio('socio-123');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});