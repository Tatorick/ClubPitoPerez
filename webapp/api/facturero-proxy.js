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
 *     path:   string,   // ej: "/login_check", "/clientes", "/documentos/facturas"
 *     method: string,   // "GET" | "POST" | "PUT" | "DELETE"
 *     body:   object,   // payload a enviar (opcional)
 *     token:  string,   // JWT de Facturero Móvil (opcional, solo para rutas autenticadas)
 *   }
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Faltan variables de entorno de Supabase.');
  return createClient(url, key);
}

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  // ── Verificar JWT de Supabase (solo admins autenticados) ──────────────────
  const authHeader = req.headers['authorization'] || '';
  const supabaseToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!supabaseToken) {
    return res.status(401).json({ error: 'No autorizado. Se requiere sesión activa.' });
  }

  const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(supabaseToken);
  if (authError || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }

  const supabase = getSupabaseAdmin();

  try {
    const { path, method = 'GET', body, token, ambiente: ambienteParam } = req.body || {};

    if (!path) {
      return res.status(400).json({ error: 'Falta el parámetro "path".' });
    }

    // ── Determinar el ambiente: usar el que viene en el request o leer de la BD ─────
    // Prioridad: 1º el que manda el frontend (para el test), 2º el de config_club
    let ambiente = ambienteParam;
    if (!ambiente) {
      const { data: config } = await supabase
        .from('config_club')
        .select('facturero_ambiente')
        .maybeSingle();
      ambiente = config?.facturero_ambiente || 'pruebas';
    }

    const baseUrl = ambiente === 'produccion'
      ? 'https://app.factureromovil.com/api'
      : 'https://apptest.factureromovil.com/api';

    // ── Construir headers ─────────────────────────────────────────────────────
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // ── Reenviar petición a Facturero Móvil ───────────────────────────────────
    const fetchOptions = {
      method: method.toUpperCase(),
      headers,
    };

    if (body && method.toUpperCase() !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const fmRes = await fetch(`${baseUrl}${path}`, fetchOptions);

    // Leer respuesta (puede ser JSON o texto)
    let fmData;
    const contentType = fmRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      fmData = await fmRes.json();
    } else {
      const text = await fmRes.text();
      try {
        fmData = JSON.parse(text);
      } catch {
        fmData = { raw: text };
      }
    }

    // Devolver el mismo status code que Facturero Móvil
    return res.status(fmRes.status).json(fmData);

  } catch (err) {
    console.error('[facturero-proxy] Error:', err);
    return res.status(500).json({ error: 'Error en el proxy.', detail: err.message });
  }
}
