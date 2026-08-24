import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rutas que requieren autenticación.
 *
 * Props:
 *   - children: el componente a renderizar si la sesión es válida
 *   - adminOnly: si true, solo usuarios con rol 'admin' pueden entrar
 *
 * Mientras carga la sesión desde localStorage, muestra un spinner.
 * Si no hay sesión, redirige a /login conservando la URL original
 * (para redirigir de vuelta después del login).
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="text-on-surface-variant text-sm font-body-md">Verificando sesión…</p>
        </div>
      </div>
    );
  }

  // Sin sesión → al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ruta solo para admin, pero el usuario no es admin → al inicio
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
