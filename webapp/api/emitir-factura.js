/**
 * api/emitir-factura.js — Vercel Serverless Function
 *
 * Emite una factura electrónica al SRI a través de AutorizadorEC.
 * Se invoca desde el Dashboard del administrador al registrar un pago
 * con la opción "Emitir factura electrónica" marcada.
 *
 * Variables de entorno requeridas (en Vercel Dashboard → Settings → Env Vars):
 *   AUTORIZADOREC_API_KEY        → sk_live_... o sk_test_...
 *   AUTORIZADOREC_BASE_URL       → https://sandbox.autorizadorec.com (pruebas)
 *                                  https://api.autorizadorec.com     (producción)
 *   SUPABASE_URL                 → URL de tu proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY    → Clave secreta de servicio (NO la anon key)
 */

import { createClient } from '@supabase/supabase-js';

// ── Cliente Supabase con service role (acceso total, solo en servidor) ──────────
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Faltan variables de entorno de Supabase en el servidor.');
  return createClient(url, key);
}

// ── Construye el tipo de identificación del comprador según SRI ──────────────
// 04 = RUC, 05 = Cédula, 06 = Pasaporte, 07 = Consumidor Final
function tipoIdentificacion(rucOCedula) {
  if (!rucOCedula) return '07'; // consumidor final
  const v = rucOCedula.trim();
  if (v.length === 13) return '04'; // RUC
  if (v.length === 10) return '05'; // Cédula
  return '06'; // Pasaporte u otro
}

// ── Genera la fecha en formato DD/MM/YYYY requerido por SRI ─────────────────
function fechaSRI(isoDate) {
  const d = new Date(isoDate || Date.now());
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ── Construye el JSON del comprobante (Factura tipo 01 — IVA 0%) ─────────────
function buildComprobantePayload({ config, miembro, transaccion }) {
  const monto = Number(transaccion.monto_real || 0).toFixed(2);
  const meses = (transaccion.meses_cubiertos || []).join(', ') || 'Mensualidad';
  const descripcion = `Mensualidad Club Pito Pérez — ${miembro.categoria || ''} — ${meses}`.trim();

  const compradorRuc   = miembro.facturacion_ruc   || '';
  const compradorNombre = miembro.facturacion_nombre || 'Consumidor Final';
  const compradorDir   = miembro.facturacion_direccion || config.direccion_matriz;
  const tipoId         = tipoIdentificacion(compradorRuc);

  const ambiente = config.autorizadorec_ambiente === 'produccion' ? '2' : '1';

  return {
    // ── Datos del emisor ──────────────────────────────────────────────────────
    ambiente,
    tipoDocumento: '01', // Factura
    infoTributaria: {
      ambiente,
      tipoEmision: '1', // Normal
      razonSocial: config.razon_social,
      nombreComercial: config.nombre_comercial || config.razon_social,
      ruc: config.ruc,
      codDoc: '01',
      estab: config.cod_establecimiento || '001',
      ptoEmi: config.cod_punto_emision || '001',
      // El secuencial y clave de acceso los genera AutorizadorEC automáticamente
    },
    // ── Datos de la factura ───────────────────────────────────────────────────
    infoFactura: {
      fechaEmision: fechaSRI(transaccion.fecha_pago),
      dirEstablecimiento: config.direccion_matriz,
      contribuyenteEspecial: config.contribuyente_especial || '',
      obligadoContabilidad: config.obligado_contabilidad || 'NO',
      tipoIdentificacionComprador: tipoId,
      razonSocialComprador: compradorNombre,
      identificacionComprador: tipoId === '07' ? '9999999999999' : compradorRuc,
      direccionComprador: compradorDir,
      totalSinImpuestos: monto,
      totalDescuento: '0.00',
      // ── Totales de impuestos (IVA 0%) ──────────────────────────────────────
      totalConImpuestos: {
        totalImpuesto: [{
          codigo: '2',              // IVA
          codigoPorcentaje: '0',    // 0 = tarifa 0%
          descuentoAdicional: '0',
          baseImponible: monto,
          valor: '0.00',
        }],
      },
      propina: '0.00',
      importeTotal: monto,
      moneda: 'DOLAR',
      pagos: [{
        formaPago: '01',  // Efectivo (SRI: 01=efectivo, 16=transferencia, 19=tarjeta)
        total: monto,
        plazo: '0',
        unidadTiempo: 'dias',
      }],
    },
    // ── Detalle de productos/servicios ────────────────────────────────────────
    detalles: [{
      codigoPrincipal: 'MENS001',
      descripcion,
      cantidad: '1.000000',
      precioUnitario: monto,
      descuento: '0.00',
      precioTotalSinImpuesto: monto,
      impuestos: [{
        codigo: '2',            // IVA
        codigoPorcentaje: '0',  // 0 = IVA 0%
        tarifa: '0',
        baseImponible: monto,
        valor: '0.00',
      }],
    }],
    // ── Información adicional (aparece en el RIDE) ────────────────────────────
    infoAdicional: [
      { nombre: 'Correo', valor: miembro.facturacion_correo || config.email_club || '' },
      { nombre: 'Teléfono', valor: miembro.facturacion_telefono || '' },
      { nombre: 'Deportista', valor: miembro.nombres || '' },
      { nombre: 'Categoría', valor: miembro.categoria || '' },
    ].filter(i => i.valor), // Elimina los vacíos
  };
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const supabase = getSupabaseAdmin();

  try {
    const { transaccion_id, miembro_id } = req.body || {};

    // ── Validaciones básicas de entrada ────────────────────────────────────────
    if (!transaccion_id || !miembro_id) {
      return res.status(400).json({ error: 'Faltan parámetros: transaccion_id y miembro_id son requeridos.' });
    }

    // ── Leer transacción ──────────────────────────────────────────────────────
    const { data: transaccion, error: txnErr } = await supabase
      .from('transacciones')
      .select('*')
      .eq('id', transaccion_id)
      .single();

    if (txnErr || !transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada.', detail: txnErr?.message });
    }

    // ── Leer datos del miembro/comprador ──────────────────────────────────────
    const { data: miembro, error: miembroErr } = await supabase
      .from('miembros')
      .select('*')
      .eq('id', miembro_id)
      .single();

    if (miembroErr || !miembro) {
      return res.status(404).json({ error: 'Miembro no encontrado.', detail: miembroErr?.message });
    }

    // ── Validar que el comprador tiene datos mínimos para facturar ────────────
    if (!miembro.facturacion_ruc && !miembro.facturacion_nombre) {
      return res.status(422).json({
        error: 'El deportista no tiene datos de facturación completos.',
        detail: 'Agrega la cédula/RUC y nombre del representante en la ficha del miembro antes de facturar.',
      });
    }

    // ── Leer configuración del club ───────────────────────────────────────────
    const { data: config, error: configErr } = await supabase
      .from('config_club')
      .select('*')
      .single();

    if (configErr || !config) {
      return res.status(503).json({ error: 'No hay configuración del club. Completa los Ajustes primero.' });
    }

    if (!config.ruc || config.ruc.length < 13) {
      return res.status(503).json({ error: 'El RUC del club no está configurado. Ve a Ajustes → Datos del Club.' });
    }

    // ── Preparar API de AutorizadorEC ─────────────────────────────────────────
    const apiKey   = process.env.AUTORIZADOREC_API_KEY || config.autorizadorec_api_key;
    const baseUrl  = process.env.AUTORIZADOREC_BASE_URL || config.autorizadorec_base_url
                     || 'https://sandbox.autorizadorec.com';

    if (!apiKey) {
      return res.status(503).json({
        error: 'API Key de AutorizadorEC no configurada.',
        detail: 'Agrégala en Ajustes → Configuración de Facturación.',
      });
    }

    // ── Crear/actualizar registro en tabla facturas (estado: procesando) ──────
    const facturaPayload = {
      transaccion_id,
      miembro_id,
      estado: 'procesando',
      intentos: 1,
      comprador_ruc:    miembro.facturacion_ruc || null,
      comprador_nombre: miembro.facturacion_nombre || null,
      monto_total:      Number(transaccion.monto_real || 0),
      meses_cubiertos:  transaccion.meses_cubiertos || [],
    };

    const { data: facturaExistente } = await supabase
      .from('facturas')
      .select('id, intentos')
      .eq('transaccion_id', transaccion_id)
      .maybeSingle();

    let facturaId;
    if (facturaExistente) {
      // Reintento: incrementar contador y resetear estado
      const { data: updated } = await supabase
        .from('facturas')
        .update({ ...facturaPayload, intentos: (facturaExistente.intentos || 0) + 1, error_detalle: null })
        .eq('id', facturaExistente.id)
        .select('id')
        .single();
      facturaId = updated?.id || facturaExistente.id;
    } else {
      const { data: nueva, error: insertErr } = await supabase
        .from('facturas')
        .insert(facturaPayload)
        .select('id')
        .single();
      if (insertErr) throw new Error(`Error creando registro de factura: ${insertErr.message}`);
      facturaId = nueva.id;
    }

    // Actualizar estado en la transacción
    await supabase
      .from('transacciones')
      .update({ estado_factura: 'procesando', factura_id: facturaId })
      .eq('id', transaccion_id);

    // ── Enviar a AutorizadorEC (modo asíncrono — no bloquea) ──────────────────
    const payload = buildComprobantePayload({ config, miembro, transaccion });

    const autorizadorRes = await fetch(`${baseUrl}/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // Referencia interna para que el webhook pueda encontrar la factura
        'X-Reference-Id': facturaId,
      },
      body: JSON.stringify({
        ...payload,
        // AutorizadorEC usa este campo para enviarnos el resultado vía webhook
        referenceId: facturaId,
      }),
    });

    const autorizadorData = await autorizadorRes.json().catch(() => ({}));

    if (!autorizadorRes.ok) {
      // Error de validación de AutorizadorEC (ej: RUC inválido, datos faltantes)
      const errorMsg = autorizadorData?.message || autorizadorData?.error || 'Error en AutorizadorEC';
      await supabase
        .from('facturas')
        .update({ estado: 'rechazada', error_detalle: errorMsg })
        .eq('id', facturaId);
      await supabase
        .from('transacciones')
        .update({ estado_factura: 'rechazada' })
        .eq('id', transaccion_id);
      return res.status(422).json({ error: errorMsg, factura_id: facturaId });
    }

    // Si AutorizadorEC devuelve un ID de documento, guardarlo
    if (autorizadorData?.id || autorizadorData?.documentId) {
      await supabase
        .from('facturas')
        .update({ autorizadorec_doc_id: autorizadorData.id || autorizadorData.documentId })
        .eq('id', facturaId);
    }

    // ── Respuesta exitosa al frontend (la factura sigue procesándose en background)
    return res.status(200).json({
      ok: true,
      factura_id: facturaId,
      estado: 'procesando',
      message: 'Factura enviada al SRI. El estado se actualizará automáticamente en unos segundos.',
    });

  } catch (err) {
    console.error('[emitir-factura] Error inesperado:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', detail: err.message });
  }
}
