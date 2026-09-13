import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Si no hay un usuario autenticado y no hay token en la URL, redirigir al login
    // Supabase automáticamente extrae el token de la URL y crea una sesión
    const hash = window.location.hash;
    if (!user && !hash.includes('access_token')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setMessage('Tu contraseña ha sido actualizada correctamente. Serás redirigido en 3 segundos...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden font-body-md">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]"></div>
      </div>

      <div className="glass-panel w-full max-w-md rounded-2xl p-8 z-10 shadow-xl border border-surface-variant relative">
        <div className="flex flex-col items-center mb-8">
          <h1 className="font-headline-md text-headline-md text-primary text-center">
            Restablecer Contraseña
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center mt-2">
            Ingresa tu nueva contraseña a continuación.
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="font-label-bold text-label-bold text-on-surface" htmlFor="password">
              Nueva Contraseña
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-bold text-label-bold text-on-surface" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-surface-bright border border-outline-variant rounded-lg font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-semibold animate-pulse">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 text-green-800 text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-primary-container transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Actualizando...
              </>
            ) : (
              'Guardar Contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
