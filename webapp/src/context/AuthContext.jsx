import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseReady } from '../lib/supabase';

// Lista de emails admin desde variable de entorno (separados por coma)
// ⚠️  SEGURIDAD IMPORTANTE: Esta verificación es solo a nivel de UI/Frontend.
//    Un usuario malintencionado con herramientas de desarrollo podría intentar
//    manipular el estado local. La protección REAL de los datos debe venir de:
//    1. Row Level Security (RLS) en Supabase para todas las tablas sensibles
//    2. Políticas de Storage para los buckets de fotos y comprobantes
//    Ver: https://supabase.com/docs/guides/database/postgres/row-level-security
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// Emails con acceso al editor de contenido (blog + galería)
const EDITOR_EMAILS = (import.meta.env.VITE_EDITOR_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// Advertencia en consola durante desarrollo para recordar configurar RLS
if (import.meta.env.DEV && ADMIN_EMAILS.length > 0) {
  console.warn(
    '⚠️ [Seguridad] La verificación de admin es frontend-only.\n' +
    'Asegúrate de tener Row Level Security (RLS) configurado en Supabase:\n' +
    '• Tabla "miembros": Solo admin puede leer/escribir\n' +
    '• Tabla "fichas": Usuario solo puede ver su propia ficha (auth.uid() = user_id)\n' +
    '• Tabla "transacciones": Usuario ve las suyas, admin ve todas\n' +
    '• Bucket "fichas-fotos": Privado, acceso solo con signed URL\n' +
    '• Bucket "fichas": Privado, acceso solo con signed URL'
  );
}

const isAdminEmail  = (email) => ADMIN_EMAILS.includes(email?.toLowerCase());
const isEditorEmail = (email) => EDITOR_EMAILS.includes(email?.toLowerCase());

// ── Contexto de Autenticación con Supabase ─────────────────────────────────────
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false); // admin también es editor

  useEffect(() => {
    // Si Supabase no está configurado, simplemente no hay sesión
    if (!supabaseReady) {
      setLoading(false);
      return;
    }

    // 1. Obtener sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(isAdminEmail(session?.user?.email));
      setIsEditor(isAdminEmail(session?.user?.email) || isEditorEmail(session?.user?.email));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Escuchar cambios de sesión (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(isAdminEmail(session?.user?.email));
      setIsEditor(isAdminEmail(session?.user?.email) || isEditorEmail(session?.user?.email));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    if (!supabaseReady) throw new Error('Supabase no está configurado.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  };

  const logout = async () => {
    if (!supabaseReady) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = { user, loading, login, logout, isAdmin, isEditor, supabaseReady };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
