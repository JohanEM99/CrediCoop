import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, User, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // VALIDACIONES
  // ============================================
  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('El correo es obligatorio');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Correo electrónico inválido');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('La contraseña es obligatoria');
      return false;
    }
    
    if (value.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  // ============================================
  // MANEJAR CAMBIOS
  // ============================================
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setGeneralError('');
    if (value) validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setGeneralError('');
    if (value) validatePassword(value);
  };

  // ============================================
  // ENVIAR FORMULARIO
  // ============================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Validar todos los campos
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsLoading(true);

      // Llamar al servicio de autenticación
      const response = await login({ email, password });

      if (!response.success) {
        setGeneralError(response.error || 'Error al iniciar sesión');
        return;
      }

      // Redirigir según el rol
      if (response.user?.rol === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (response.user?.rol === 'SOCIO') {
        navigate('/socio/mis-prestamos');
      } else {
        setGeneralError('Rol de usuario no válido');
      }

    } catch (error: any) {
      console.error('Error en login:', error);
      setGeneralError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // AUTO-COMPLETAR
  // ============================================
  const fillExample = (type: 'admin' | 'socio') => {
    if (type === 'admin') {
      setEmail('admin@credicoop.com');
      setPassword('admin123');
    } else {
      setEmail('socio@credicoop.com');
      setPassword('socio123');
    }
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          
          {/* Header con Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-50 h-50 mb-4">
              <img 
                src="/Logo.png" 
                alt="Credicoop Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Credicoop</h1>
            <p className="text-gray-600 mt-2">Sistema de Gestión de Préstamos</p>
          </div>

          {/* Error General */}
          {generalError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{generalError}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all ${
                    emailError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } focus:ring-2 focus:border-transparent`}
                  placeholder="correo@ejemplo.com"
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-all ${
                    passwordError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } focus:ring-2 focus:border-transparent`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Ejemplos */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Credenciales de prueba:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillExample('admin')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-lg transition-colors"
                disabled={isLoading}
              >
                👤 Admin
              </button>
              <button
                type="button"
                onClick={() => fillExample('socio')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-2 px-3 rounded-lg transition-colors"
                disabled={isLoading}
              >
                👥 Socio
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 Credicoop. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;