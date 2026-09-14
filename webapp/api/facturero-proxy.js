/**
 * api/facturero-proxy.js — Vercel Serverless Function
 *
 * Proxy para la API de Facturero Móvil.
 * Las credenciales se leen desde variables de entorno de Vercel (seguras, server-side).
 * El navegador NO puede llamar directamente a app.factureromovil.com por CORS.
 *
 * Variables de entorno requeridas en Vercel:
 *   FACTURERO_USER      → usuario.api
 *   FACTURERO_PASSWORD  → usuario.api
 *   FACTURERO_AMBIENTE  → produccion | pruebas
 *
 * Body esperado del frontend:
 *   {
 *     path:   string,  // ej: "/login_check", "/clientes", "/documentos/facturas"
 *     method: string,  // "GET" | "POST" | "PUT" | "DELETE"
 *     body:   object,  // payload (opcional)
 *     token:  string,  // JWT de Facturero Móvil ya obtenido (opcional)
 *   }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  try {
    // ── Leer credenciales de Facturero Móvil desde env vars ──────────────────
    const fmUser     = process.env.FACTURERO_USER;
    const fmPassword = process.env.FACTURERO_PASSWORD;
    const fmAmbiente = process.env.FACTURERO_AMBIENTE || 'produccion';

    if (!fmUser || !fmPassword) {
      console.error('[facturero-proxy] Faltan FACTURERO_USER o FACTURERO_PASSWORD en env vars');
      return res.status(500).json({
        error: 'Credenciales de Facturero Móvil no configuradas en el servidor.',
        detail: 'Agrega FACTURERO_USER y FACTURERO_PASSWORD en las variables de entorno de Vercel.',
      });
    }

    const baseUrl = fmAmbiente === 'produccion'
      ? 'https://app.factureromovil.com/api'
      : 'https://apptest.factureromovil.com/api';

    const { path, method = 'GET', body, token } = req.body || {};

    if (!path) {
      return res.status(400).json({ error: 'Falta el parámetro "path".' });
    }

    // ── Para /login_check: usar credenciales de env vars ──────────────────────
    // El frontend no necesita enviar usuario/contraseña — el proxy los inyecta
    let requestBody = body;
    if (path === '/login_check') {
      requestBody = {
        _username: fmUser,
        _password: fmPassword,
      };
    }

    // ── Construir headers ─────────────────────────────────────────────────────
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
      method: method.toUpperCase(),
      headers,
      signal: AbortSignal.timeout(20000), // 20 segundos
    };

    if (requestBody && method.toUpperCase() !== 'GET') {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    console.log(`[facturero-proxy] ${method.toUpperCase()} ${baseUrl}${path} (${fmAmbiente})`);

    // ── Llamar a Facturero Móvil ──────────────────────────────────────────────
    let fmRes;
    try {
      fmRes = await fetch(`${baseUrl}${path}`, fetchOptions);
    } catch (fetchErr) {
      const isTimeout = fetchErr.name === 'TimeoutError' || fetchErr.name === 'AbortError';
      console.error('[facturero-proxy] Error de red:', fetchErr.message);
      return res.status(502).json({
        error: isTimeout
          ? 'Tiempo de espera agotado al contactar Facturero Móvil (>20s).'
          : `No se pudo conectar a ${baseUrl}: ${fetchErr.message}`,
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

    console.log(`[facturero-proxy] Respuesta FM: ${fmRes.status}`);
    return res.status(fmRes.status).json(fmData);

  } catch (err) {
    console.error('[facturero-proxy] Error inesperado:', err);
    return res.status(500).json({
      error: 'Error inesperado en el proxy.',
      detail: err?.message || String(err),
    });
  }
}
