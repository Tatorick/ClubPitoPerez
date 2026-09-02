/**
 * api/webhook-autorizadorec.js — Vercel Serverless Function
 *
 * Endpoint público que recibe notificaciones (webhooks) de AutorizadorEC
 * cuando el SRI autoriza o rechaza un comprobante electrónico.
 *
 * AutorizadorEC firma cada request con HMAC-SHA256 usando el secreto configurado.
 * Esta función valida la firma ANTES de procesar el evento.
 *
 * Variables de entorno requeridas:
 *   AUTORIZADOREC_WEBHOOK_SECRET  → Secreto para validar HMAC-SHA256
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * URL a configurar en AutorizadorEC:
 *   https://tu-dominio.vercel.app/api/webhook-autorizadorec
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ── Cliente Supabase con service role ────────────────────────────────────────
function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ── Valida la firma HMAC-SHA256 del webhook ──────────────────────────────────
// AutorizadorEC envía la firma en el header: X-AutorizadorEC-Signature
// La firma es: HMAC-SHA256(rawBody, webhookSecret) en hexadecimal
function validarFirmaHmac(rawBody, signatureHeader, secret) {
  if (!secret) {
    // Si no hay secreto configurado, en modo desarrollo lo dejamos pasar con advertencia
    console.warn('[webhook] AUTORIZADOREC_WEBHOOK_SECRET no configurado — firma no validada');
    return true;
  }
  if (!signatureHeader) return false;

  try {
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    // Comparación en tiempo constante para evitar timing attacks
    const sigBuffer = Buffer.from(signatureHeader, 'hex');
    const expBuffer = Buffer.from(expectedSig, 'hex');

    if (sigBuffer.length !== expBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expBuffer);
  } catch {
    return false;
  }
}

// ── Mapea el estado de AutorizadorEC al estado interno ──────────────────────
function mapearEstado(estadoExterno) {
  const mapa = {
    AUTHORIZED: 'autorizada',
    REJECTED: 'rechazada',
    PROCESSING: 'procesando',
    ERROR: 'rechazada',
  };
  return mapa[estadoExterno?.toUpperCase()] || 'procesando';
}

// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  // ── Leer el body raw para validar la firma ────────────────────────────────
  // Vercel por defecto parsea el body como JSON, necesitamos el raw string
  let rawBody;
  let body;

  try {
    // En Vercel, el body ya viene parseado si Content-Type es application/json
    // Reconstruimos el rawBody para la validación HMAC
    body = req.body || {};
    rawBody = JSON.stringify(body);
  } catch {
    return res.status(400).json({ error: 'Body inválido.' });
  }

  // ── Validar firma HMAC-SHA256 ─────────────────────────────────────────────
  const signature = req.headers['x-autorizadorec-signature']
                 || req.headers['x-webhook-signature']
                 || '';
  const webhookSecret = process.env.AUTORIZADOREC_WEBHOOK_SECRET;

  if (!validarFirmaHmac(rawBody, signature, webhookSecret)) {
    console.error('[webhook] Firma HMAC inválida — posible solicitud no autorizada');
    return res.status(401).json({ error: 'Firma inválida.' });
  }

  // ── Parsear el evento de AutorizadorEC ────────────────────────────────────
  // Estructura esperada (puede variar según la versión de AutorizadorEC):
  // {
  //   event: 'AUTHORIZED' | 'REJECTED',
  //   referenceId: 'uuid-de-tu-factura',   ← el que enviamos como X-Reference-Id
  //   documentId: 'doc_xxx',               ← ID interno de AutorizadorEC
  //   claveAcceso: '...',                  ← 49 dígitos (solo si AUTHORIZED)
  //   numeroAutorizacion: '...',
  //   secuencial: '000000001',
  //   urlRide: 'https://...',              ← PDF del RIDE autorizado
  //   urlXml: 'https://...',              ← XML firmado
  //   errorDetalle: '...',                ← Motivo si REJECTED
  //   fechaAutorizacion: '...',
  // }

  const {
    event,
    referenceId,
    documentId,
    claveAcceso,
    numeroAutorizacion,
    secuencial,
    urlRide,
    urlXml,
    errorDetalle,
  } = body;

  const estadoInterno = mapearEstado(event);

  if (!referenceId) {
    console.warn('[webhook] Sin referenceId en el evento — ignorando');
    return res.status(200).json({ ok: true, skipped: 'Sin referenceId' });
  }

  const supabase = getSupabaseAdmin();

  try {
    // ── Buscar la factura por referenceId ────────────────────────────────────
    const { data: factura, error: findErr } = await supabase
      .from('facturas')
      .select('id, transaccion_id, estado')
      .eq('id', referenceId)
      .maybeSingle();

    if (findErr || !factura) {
      // También intentar por autorizadorec_doc_id como fallback
      const { data: facturaByDocId } = await supabase
        .from('facturas')
        .select('id, transaccion_id, estado')
        .eq('autorizadorec_doc_id', documentId)
        .maybeSingle();

      if (!facturaByDocId) {
        console.warn(`[webhook] Factura no encontrada para referenceId=${referenceId}, documentId=${documentId}`);
        return res.status(200).json({ ok: true, skipped: 'Factura no encontrada' });
      }
    }

    const facturaId = factura?.id || referenceId;
    const transaccionId = factura?.transaccion_id;

    // ── Actualizar tabla facturas ─────────────────────────────────────────────
    const updateFactura = {
      estado: estadoInterno,
      autorizadorec_doc_id: documentId || null,
      ...(estadoInterno === 'autorizada' && {
        clave_acceso:          claveAcceso || null,
        numero_autorizacion:   numeroAutorizacion || null,
        secuencial:            secuencial || null,
        url_ride:              urlRide || null,
        url_xml:               urlXml || null,
        error_detalle:         null, // Limpiar errores previos si ahora está autorizada
      }),
      ...(estadoInterno === 'rechazada' && {
        error_detalle: errorDetalle || 'Rechazada por el SRI sin detalle adicional.',
      }),
    };

    await supabase
      .from('facturas')
      .update(updateFactura)
      .eq('id', facturaId);

    // ── Actualizar estado_factura en la transacción correspondiente ───────────
    if (transaccionId) {
      await supabase
        .from('transacciones')
        .update({ estado_factura: estadoInterno })
        .eq('id', transaccionId);
    }

    console.log(`[webhook] Factura ${facturaId} → ${estadoInterno}` +
      (estadoInterno === 'autorizada' ? ` | Auth: ${numeroAutorizacion}` : '') +
      (estadoInterno === 'rechazada'  ? ` | Error: ${errorDetalle}` : ''));

    // ── Responder 200 OK a AutorizadorEC (obligatorio para evitar reintentos) ──
    return res.status(200).json({
      ok: true,
      factura_id: facturaId,
      nuevo_estado: estadoInterno,
    });

  } catch (err) {
    console.error('[webhook] Error inesperado:', err);
    // Devolver 200 de todas formas para evitar que AutorizadorEC reintente indefinidamente
    // El error quedará en los logs de Vercel para diagnóstico
    return res.status(200).json({ ok: false, error: err.message });
  }
}

// ── Configuración de Vercel: necesitamos el raw body para validar HMAC ───────
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
