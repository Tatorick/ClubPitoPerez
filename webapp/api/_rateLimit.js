/**
 * api/_rateLimit.js — Rate Limiting utilitario para Serverless Functions
 *
 * Implementa una ventana deslizante por IP.
 * Nota: en Vercel cada instancia serverless tiene su propia memoria,
 * así que este rate limit es "por instancia". Protege contra ráfagas
 * rápidas (el caso más común de abuso) sin dependencias externas.
 *
 * Para producción a gran escala considera Upstash Redis como alternativa.
 */

// Map<ip, number[]> → almacena timestamps de cada request por IP
const requestLog = new Map();

// Limpieza periódica para evitar memory leaks (cada 5 minutos)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestLog.entries()) {
    const fresh = timestamps.filter(t => now - t < 60_000);
    if (fresh.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, fresh);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Verifica si la IP supera el límite en la ventana de 60 segundos.
 *
 * @param {string} ip           - Dirección IP del cliente
 * @param {number} maxRequests  - Máximo de peticiones permitidas por minuto
 * @returns {{ allowed: boolean, remaining: number, resetInMs: number }}
 */
export function checkRateLimit(ip, maxRequests = 10) {
  const now = Date.now();
  const windowMs = 60_000; // 1 minuto

  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < windowMs);
  timestamps.push(now);
  requestLog.set(ip, timestamps);

  const count = timestamps.length;
  const oldest = timestamps[0];
  const resetInMs = oldest ? windowMs - (now - oldest) : windowMs;

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetInMs,
  };
}

/**
 * Extrae la IP real del cliente teniendo en cuenta proxies de Vercel.
 * @param {object} req - Request de Vercel Serverless
 * @returns {string}
 */
export function getClientIp(req) {
  return (
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}
