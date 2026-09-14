/**
 * api/facturero-proxy.js — Vercel Serverless Function
 *
 * Proxy para la API de Facturero Móvil.
 * El navegador NO puede llamar directamente a app.factureromovil.com por CORS.
 * Este endpoint recibe la petición del frontend, la reenvía desde el servidor
 * (donde CORS no aplica) y devuelve la respuesta.
 *
 * Body esperado:
 *   {
 *     path:      string,   // ej: "/login_check", "/clientes", "/documentos/facturas"
 *     method:    string,   // "GET" | "POST" | "PUT" | "DELETE"
 *     body:      object,   // payload a enviar (opcional)
 *     token:     string,   // JWT de Facturero Móvil (opcional, rutas autenticadas)
 *     ambiente:  string,   // "produccion" | "pruebas" (opcional, prioridad sobre BD)
 *   }
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  // ── Todo dentro de un try-catch global para evitar 500 sin formato ────────
  try {

    // ── Verificar JWT de Supabase (solo admins autenticados) ─────────────────
    const authHeader = req.headers['authorization'] || '';
    const supabaseToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!supabaseToken) {
      return res.status(401).json({ error: 'No autorizado. Se requiere sesión activa.' });
    }

    // Solo necesitamos SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
    // (el cliente con service role puede verificar JWTs también)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSvc = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSvc) {
      console.error('[facturero-proxy] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
      return res.status(500).json({
        error: 'Configuración del servidor incompleta.',
        detail: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel.',
      });
    }

    // Auth check usando service role (no necesita anon key)
    let authUser = null;
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseSvc);
      const authResult = await supabaseAdmin.auth.getUser(supabaseToken);
      authUser = authResult?.data?.user || null;
      if (authResult?.error) {
        console.warn('[facturero-proxy] Auth error:', authResult.error.message);
      }
    } catch (authErr) {
      console.error('[facturero-proxy] Error verificando token:', authErr);
      return res.status(401).json({ error: 'Error verificando sesión.', detail: authErr.message });
    }

    if (!authUser) {
      return res.status(401).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }

    // ── Leer y validar el body del request ───────────────────────────────────
    const { path, method = 'GET', body, token, ambiente: ambienteParam } = req.body || {};

    if (!path) {
      return res.status(400).json({ error: 'Falta el parámetro "path".' });
    }

    // ── Determinar ambiente y URL base ────────────────────────────────────────
    // Prioridad: 1º el que viene en el request (para el test de conexión)
    //            2º el guardado en config_club
    let ambiente = ambienteParam;
    if (!ambiente) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseSvc);
        const { data: config } = await supabaseAdmin
          .from('config_club')
          .select('facturero_ambiente')
          .maybeSingle();
        ambiente = config?.facturero_ambiente || 'pruebas';
      } catch (dbErr) {
        console.warn('[facturero-proxy] No se pudo leer config_club:', dbErr.message);
        ambiente = 'pruebas';
      }
    }

    const baseUrl = ambiente === 'produccion'
      ? 'https://app.factureromovil.com/api'
      : 'https://apptest.factureromovil.com/api';

    console.log(`[facturero-proxy] ${method.toUpperCase()} ${baseUrl}${path} (ambiente: ${ambiente})`);

    // ── Construir headers para la petición a Facturero Móvil ─────────────────
    const fmHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      fmHeaders['Authorization'] = `Bearer ${token}`;
    }

    // ── Preparar opciones del fetch ───────────────────────────────────────────
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: fmHeaders,
      signal: AbortSignal.timeout(15000), // Timeout de 15 segundos
    };

    if (body && method.toUpperCase() !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    // ── Llamar a Facturero Móvil ──────────────────────────────────────────────
    let fmRes;
    try {
      fmRes = await fetch(`${baseUrl}${path}`, fetchOptions);
    } catch (fetchErr) {
      const isTimeout = fetchErr.name === 'TimeoutError' || fetchErr.name === 'AbortError';
      console.error('[facturero-proxy] Error de red hacia Facturero Móvil:', fetchErr.message);
      return res.status(502).json({
        error: isTimeout
          ? 'Tiempo de espera agotado al contactar Facturero Móvil.'
          : 'No se pudo conectar a Facturero Móvil.',
        detail: fetchErr.message,
      });
    }

    // ── Leer respuesta ────────────────────────────────────────────────────────
    let fmData;
    const contentType = fmRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      fmData = await fmRes.json().catch(() => ({}));
    } else {
      const text = await fmRes.text().catch(() => '');
      try { fmData = JSON.parse(text); } catch { fmData = { message: text || 'Sin respuesta' }; }
    }

    console.log(`[facturero-proxy] Respuesta de FM: ${fmRes.status}`);

    // ── Devolver el mismo status que Facturero Móvil ──────────────────────────
    return res.status(fmRes.status).json(fmData);

  } catch (err) {
    // Catch-all de último recurso — garantiza siempre JSON, nunca HTML 500 de Vercel
    console.error('[facturero-proxy] Error inesperado:', err);
    return res.status(500).json({
      error: 'Error inesperado en el proxy.',
      detail: err?.message || String(err),
    });
  }
}
