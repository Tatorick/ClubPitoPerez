import { useState, useRef, useEffect } from 'react';
import { derivarEstadoMeses } from '../../utils/pagos';
import { supabase } from '../../lib/supabase';

// ─── Config de estilos por estado ────────────────────────────────────────────
const ESTADO_CONFIG = {
  pagado:          { bg: 'bg-green-50',   border: 'border-green-300',  icon: 'check_circle',  iconColor: 'text-green-600',  label: 'Pagado',           ring: 'hover:ring-2 hover:ring-green-400 cursor-pointer' },
  adelanto:        { bg: 'bg-blue-50',    border: 'border-blue-300',   icon: 'schedule_send', iconColor: 'text-blue-600',   label: 'Adelanto',         ring: 'hover:ring-2 hover:ring-blue-400 cursor-pointer' },
  pendiente:       { bg: 'bg-amber-50',   border: 'border-amber-300',  icon: 'schedule',      iconColor: 'text-amber-500',  label: 'Pendiente',        ring: '' },
  vencido:         { bg: 'bg-red-50',     border: 'border-red-300',    icon: 'warning',       iconColor: 'text-red-500',    label: 'Vencido',          ring: '' },
  futuro:          { bg: 'bg-gray-50',    border: 'border-gray-200',   icon: 'remove',        iconColor: 'text-gray-300',   label: '—',                ring: '' },
  en_verificacion: { bg: 'bg-orange-50',  border: 'border-orange-400', icon: 'hourglass_top', iconColor: 'text-orange-500', label: 'En verificación',  ring: 'hover:ring-2 hover:ring-orange-400 cursor-pointer' },
  rechazado:       { bg: 'bg-rose-50',    border: 'border-rose-400',   icon: 'cancel',        iconColor: 'text-rose-600',   label: 'Rechazado',        ring: 'hover:ring-2 hover:ring-rose-400 cursor-pointer' },
};

// ─── Visor de Comprobante (con acciones de verificación para admin) ─────────────
function ReceiptViewer({ transaccion, mesCodigo, onClose, onAprobar, onRechazar }) {
  const [accionLoading, setAccionLoading] = useState(null); // 'aprobar' | 'rechazar'
  const [notaRechazo, setNotaRechazo] = useState('');
  const [showRechazoInput, setShowRechazoInput] = useState(false);

  const esPendiente = transaccion.estado_verificacion === 'pendiente_verificacion';

  const handleAprobar = async () => {
    setAccionLoading('aprobar');
    await onAprobar(transaccion);
    setAccionLoading(null);
    onClose();
  };

  const handleRechazar = async () => {
    setAccionLoading('rechazar');
    await onRechazar(transaccion, notaRechazo);
    setAccionLoading(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-800">Comprobante de Pago</h3>
            <p className="text-xs text-gray-500 mt-0.5">Fecha: {transaccion.fecha_pago} · ${Number(transaccion.monto_real).toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            {transaccion.comprobante_url && (
              <a href={transaccion.comprobante_url} download target="_blank" rel="noreferrer"
                 className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span> Descargar
              </a>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-gray-500">close</span>
            </button>
          </div>
        </div>

        {/* Badge de estado de verificación */}
        {transaccion.estado_verificacion && (
          <div className={`px-5 py-2.5 border-b flex items-center gap-2 ${
            esPendiente ? 'bg-orange-50 border-orange-200' :
            transaccion.estado_verificacion === 'aprobado' ? 'bg-green-50 border-green-200' :
            'bg-rose-50 border-rose-200'
          }`}>
            <span className={`material-symbols-outlined text-[18px] ${
              esPendiente ? 'text-orange-500 animate-pulse' :
              transaccion.estado_verificacion === 'aprobado' ? 'text-green-600' : 'text-rose-600'
            }`}>
              {esPendiente ? 'hourglass_top' : transaccion.estado_verificacion === 'aprobado' ? 'verified' : 'cancel'}
            </span>
            <span className={`text-xs font-bold ${
              esPendiente ? 'text-orange-700' :
              transaccion.estado_verificacion === 'aprobado' ? 'text-green-700' : 'text-rose-700'
            }`}>
              {esPendiente ? 'Pendiente de verificación por el administrador' :
               transaccion.estado_verificacion === 'aprobado' ? 'Pago aprobado por el administrador' :
               'Pago rechazado por el administrador'}
            </span>
          </div>
        )}

        {/* Meses cubiertos por esta transacción */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meses cubiertos por este pago</p>
          <div className="flex gap-2 flex-wrap">
            {transaccion.meses_cubiertos?.map(cod => (
              <span key={cod}
                className={`px-3 py-1 rounded-full text-xs font-bold border ${cod === mesCodigo ? 'bg-[#001f3f] text-white border-[#001f3f]' : 'bg-white text-gray-600 border-gray-300'}`}>
                {cod}
              </span>
            ))}
          </div>
          {transaccion.notas && (
            <p className="text-xs text-gray-500 mt-2 italic">📝 "{transaccion.notas}"</p>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex items-center justify-center min-h-56">
          {transaccion.comprobante_url ? (
            <img src={transaccion.comprobante_url} alt="Comprobante"
                 className="max-w-full rounded-lg shadow object-contain max-h-80" />
          ) : (
            <div className="text-center text-gray-400 py-10">
              <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
              <p className="text-sm">Sin imagen adjunta.</p>
            </div>
          )}
        </div>

        {/* Acciones de verificación — solo visibles cuando está pendiente */}
        {esPendiente && onAprobar && onRechazar && (
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
            {!showRechazoInput ? (
              <div className="flex gap-3">
                <button
                  onClick={handleAprobar}
                  disabled={!!accionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {accionLoading === 'aprobar' ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  )}
                  Aprobar Pago
                </button>
                <button
                  onClick={() => setShowRechazoInput(true)}
                  disabled={!!accionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Rechazar Pago
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={notaRechazo}
                  onChange={e => setNotaRechazo(e.target.value)}
                  placeholder="Motivo del rechazo (opcional)..."
                  rows={2}
                  className="w-full border border-rose-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRechazar}
                    disabled={!!accionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 disabled:opacity-50 transition-colors"
                  >
                    {accionLoading === 'rechazar' ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    )}
                    Confirmar Rechazo
                  </button>
                  <button
                    onClick={() => setShowRechazoInput(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Badge visual del estado de factura ──────────────────────────────────────
export function FacturaBadge({ estado, url_ride, onReintentar }) {
  if (!estado || estado === 'pendiente') return null;

  const configs = {
    procesando: { bg: 'bg-amber-50 border-amber-200 text-amber-700', icon: 'progress_activity', label: 'Procesando...', spin: true },
    autorizada:  { bg: 'bg-green-50 border-green-200 text-green-700', icon: 'check_circle', label: 'Factura autorizada', spin: false },
    rechazada:   { bg: 'bg-red-50 border-red-200 text-red-700',       icon: 'cancel', label: 'Rechazada por SRI', spin: false },
  };
  const c = configs[estado] || configs.procesando;

  return (
    <div className={`flex items-center gap-2 mt-1 flex-wrap`}>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg}`}>
        <span className={`material-symbols-outlined text-[12px] ${c.spin ? 'animate-spin' : ''}`}>{c.icon}</span>
        {c.label}
      </span>
      {estado === 'autorizada' && url_ride && (
        <a href={url_ride} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-600 text-white hover:bg-green-700 transition-colors">
          <span className="material-symbols-outlined text-[12px]">download</span>
          Descargar PDF
        </a>
      )}
      {estado === 'rechazada' && onReintentar && (
        <button onClick={onReintentar}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">
          <span className="material-symbols-outlined text-[12px]">refresh</span>
          Reintentar
        </button>
      )}
    </div>
  );
}

// ─── Formulario de Registro de Pago ──────────────────────────────────────────
function RegisterPaymentForm({ mesesStatus, onSave, onClose, miembro }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [notas, setNotas] = useState('');
  const [montoReal, setMontoReal] = useState('');
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  // Factura electrónica: pre-marcar si el miembro tiene datos de facturación
  const tieneDatosFacturacion = !!(miembro?.facturacion_ruc && miembro?.facturacion_nombre);
  const [emitirFactura, setEmitirFactura] = useState(tieneDatosFacturacion);

  // Solo mostrar meses que NO están pagados ni adelantados
  const mesesDisponibles = mesesStatus.filter(m => !['pagado', 'adelanto'].includes(m.estado));
  const montoPension = mesesDisponibles[0]?.montoPension || 35;
  const montoCalculado = mesesSeleccionados.reduce((sum, cod) => {
    const m = mesesDisponibles.find(m => m.codigo === cod);
    return sum + (m ? m.montoPension : 0);
  }, 0);

  const toggleMes = (cod) => {
    setMesesSeleccionados(prev =>
      prev.includes(cod) ? prev.filter(c => c !== cod) : [...prev, cod]
    );
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mesesSeleccionados.length === 0) { alert('Selecciona al menos un mes.'); return; }
    onSave({
      id: `txn-${Date.now()}`,
      fecha_pago: fecha,
      monto_real: parseFloat(montoReal) || montoCalculado,
      notas,
      comprobante_url: preview,
      meses_cubiertos: mesesSeleccionados,
      estado_factura: emitirFactura ? 'procesando' : 'pendiente',
      _emitirFactura: emitirFactura, // Flag interno, no va a la BD
    });
  };

  const estadoStyles = { vencido: 'border-red-300 bg-red-50 text-red-700', pendiente: 'border-amber-300 bg-amber-50 text-amber-700', futuro: 'border-gray-200 bg-gray-50 text-gray-500' };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#001f3f]">
          <h3 className="font-bold text-white">Registrar Pago</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form id="register-form" onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Selección de meses */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Meses que cubre este pago
                <span className="ml-1 text-gray-400 font-normal">(selecciona uno o más)</span>
              </label>
              {mesesDisponibles.length === 0 ? (
                <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">✓ Todos los meses están al día.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mesesDisponibles.map(m => {
                    const selected = mesesSeleccionados.includes(m.codigo);
                    return (
                      <button key={m.codigo} type="button" onClick={() => toggleMes(m.codigo)}
                        className={`flex flex-col items-center py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${
                          selected
                            ? 'border-[#001f3f] bg-[#001f3f] text-white shadow-md scale-105'
                            : estadoStyles[m.estado] + ' hover:scale-102'
                        }`}>
                        <span>{m.codigo}</span>
                        <span className="font-normal opacity-70 mt-0.5">${m.montoPension.toFixed(0)}</span>
                        {m.estado === 'vencido'   && <span className="text-[9px] mt-0.5 opacity-80">VENCIDO</span>}
                        {m.estado === 'pendiente' && <span className="text-[9px] mt-0.5 opacity-80">ACTUAL</span>}
                        {m.estado === 'futuro'    && <span className="text-[9px] mt-0.5 opacity-80">ADELANTO</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Montos */}
            {mesesSeleccionados.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold">Total esperado</p>
                  <p className="text-2xl font-bold text-blue-800">${montoCalculado.toFixed(2)}</p>
                  <p className="text-xs text-blue-500">{mesesSeleccionados.length} mes{mesesSeleccionados.length > 1 ? 'es' : ''}: {mesesSeleccionados.join(', ')}</p>
                </div>
                <div className="text-right">
                  <label className="text-xs font-bold text-blue-700 block mb-1">Monto real depositado</label>
                  <input type="number" step="0.01" value={montoReal} onChange={e => setMontoReal(e.target.value)}
                    placeholder={montoCalculado.toFixed(2)}
                    className="w-28 text-right border border-blue-300 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-600" />
                </div>
              </div>
            )}

            {/* Fecha */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Fecha del pago</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" />
            </div>

            {/* Comprobante */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Comprobante de depósito</label>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Comprobante" className="w-full rounded-xl object-cover max-h-40 border border-gray-200" />
                  <button type="button" onClick={() => setPreview(null)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-600 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRef.current.click()}
                    className="flex-1 flex flex-col items-center py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm">
                    <span className="material-symbols-outlined text-2xl mb-1">upload_file</span>
                    Subir imagen
                  </button>
                  <button type="button" onClick={() => { fileRef.current.setAttribute('capture','environment'); fileRef.current.click(); }}
                    className="flex-1 flex flex-col items-center py-4 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm">
                    <span className="material-symbols-outlined text-2xl mb-1">photo_camera</span>
                    Tomar foto
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">Opcional — pero recomendado para respaldo.</p>
            </div>

            {/* ── Factura electrónica ── */}
            <div className="border-t border-gray-100 pt-4">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${emitirFactura ? 'border-[#001f3f] bg-[#001f3f]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" checked={emitirFactura}
                  onChange={e => setEmitirFactura(e.target.checked)}
                  className="mt-0.5 accent-[#001f3f] w-4 h-4 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#001f3f]">receipt_long</span>
                    Emitir factura electrónica SRI
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tieneDatosFacturacion
                      ? `Se facturará a: ${miembro?.facturacion_nombre} · ${miembro?.facturacion_ruc}`
                      : '⚠ El miembro no tiene datos de facturación completos (RUC/cédula y nombre).'}
                  </p>
                </div>
              </label>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Notas <span className="font-normal text-gray-400">(opcional)</span></label>
              <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                placeholder="Ej: Pago de meses pendientes, abono parcial, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="register-form"
            className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Guardar Pago
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab de Pagos ─────────────────────────────────────────────────────────────
function PagosTab({ member, onUpdateMember }) {
  const [receiptOpen, setReceiptOpen] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const montoPension = Number(member.monto_pension ?? 55.00);
  const tieneBeca = member.tiene_beca === true || (montoPension < 55.00);
  const tipoBeca = member.tipo_beca || (tieneBeca ? 'Beca Deportiva' : null);

  const mesesStatus = derivarEstadoMeses(member.transacciones, montoPension);
  const pagados    = mesesStatus.filter(m => ['pagado','adelanto'].includes(m.estado)).length;
  const vencidos   = mesesStatus.filter(m => m.estado === 'vencido').length;
  const enVerificacion = mesesStatus.filter(m => m.estado === 'en_verificacion').length;
  const totalPagado = (member.transacciones || []).reduce((s, t) => s + Number(t.monto_real || 0), 0);
  const montoVencido = mesesStatus.filter(m => m.estado === 'vencido').reduce((s, m) => s + m.montoPension, 0);

  const handleSavePago = async (nuevaTxn) => {
    const emitirFactura = nuevaTxn._emitirFactura;
    delete nuevaTxn._emitirFactura; // Limpiar flag interno

    try {
      if (member.id && !member.id.startsWith('demo-')) {
        const { data: dbTxn, error: tErr } = await supabase.from('transacciones').insert({
          miembro_id: member.id,
          fecha_pago: nuevaTxn.fecha_pago,
          monto_real: nuevaTxn.monto_real,
          notas: nuevaTxn.notas,
          comprobante_url: nuevaTxn.comprobante_url,
          meses_cubiertos: nuevaTxn.meses_cubiertos,
          estado_factura: emitirFactura ? 'procesando' : 'pendiente',
        }).select().single();

        if (tErr) console.error('Error guardando transaccion en Supabase:', tErr);
        if (dbTxn) {
          nuevaTxn = dbTxn;

          // ── Emitir factura electrónica si el admin lo solicitó ──────────────
          if (emitirFactura) {
            try {
              const res = await fetch('/api/emitir-factura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transaccion_id: dbTxn.id,
                  miembro_id: member.id,
                }),
              });
              const facturaRes = await res.json();
              if (!res.ok) {
                console.warn('Factura no emitida:', facturaRes.error);
                // Actualizar estado en la transacción guardada
                nuevaTxn = { ...nuevaTxn, estado_factura: 'rechazada' };
              } else {
                nuevaTxn = { ...nuevaTxn, estado_factura: 'procesando', factura_id: facturaRes.factura_id };
              }
            } catch (err) {
              console.error('Error llamando a emitir-factura:', err);
              nuevaTxn = { ...nuevaTxn, estado_factura: 'rechazada' };
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }

    const updatedMember = {
      ...member,
      transacciones: [...(member.transacciones || []), nuevaTxn]
    };
    if (onUpdateMember) onUpdateMember(updatedMember);
    setRegisterOpen(false);
  };

  // ── Reintentar factura rechazada ────────────────────────────────────────────
  const handleReintentarFactura = async (txn) => {
    if (!member.id || !txn.id) return;
    try {
      const res = await fetch('/api/emitir-factura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaccion_id: txn.id, miembro_id: member.id }),
      });
      const data = await res.json();
      if (res.ok) {
        // Optimistic update: marcar como procesando en la UI
        const updatedTxns = (member.transacciones || []).map(t =>
          t.id === txn.id ? { ...t, estado_factura: 'procesando' } : t
        );
        if (onUpdateMember) onUpdateMember({ ...member, transacciones: updatedTxns });
      } else {
        alert(`No se pudo reintentar la factura: ${data.error}`);
      }
    } catch (err) {
      alert(`Error al reintentar: ${err.message}`);
    }
  };

  // ── Aprobar/Rechazar pago del representante ─────────────────────────────────
  const handleVerificarPago = async (txn, nuevoEstado, notaExtra) => {
    if (!txn.id) return;
    const updateData = { estado_verificacion: nuevoEstado };
    if (notaExtra) updateData.notas = `${txn.notas || ''} [${nuevoEstado === 'rechazado' ? 'Rechazado' : 'Aprobado'}: ${notaExtra}]`.trim();

    const { error } = await supabase
      .from('transacciones')
      .update(updateData)
      .eq('id', txn.id);

    if (error) {
      console.error('Error al verificar pago:', error);
      alert('No se pudo actualizar el estado del pago. Intenta nuevamente.');
      return;
    }

    // Actualizar la UI de forma optimista
    const updatedTxns = (member.transacciones || []).map(t =>
      t.id === txn.id ? { ...t, ...updateData } : t
    );
    if (onUpdateMember) onUpdateMember({ ...member, transacciones: updatedTxns });
  };

  const handleCellClick = (mes) => {
    if (!mes.transaccion) return;
    setReceiptOpen({ transaccion: mes.transaccion, mesCodigo: mes.codigo });
  };

  return (
    <div className="p-6 space-y-6">
      {tieneBeca && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">star</span>
            <div>
              <p className="text-xs font-bold text-amber-900">{tipoBeca || 'Deportista con Beca'}</p>
              <p className="text-[11px] text-amber-700">Pensión asignada: <strong>${montoPension.toFixed(2)}/mes</strong> (Pensión regular: $55.00)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900">
            ${montoPension.toFixed(2)} / mes
          </span>
        </div>
      )}

      {/* Banner de pagos pendientes de verificación */}
      {enVerificacion > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 animate-pulse">hourglass_top</span>
            <div>
              <p className="text-xs font-bold text-orange-900">{enVerificacion} pago(s) pendiente(s) de verificación</p>
              <p className="text-[11px] text-orange-700">Revisa el comprobante y aprueba o rechaza cada pago.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-200 text-orange-900">
            Acción requerida
          </span>
        </div>
      )}

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{pagados}</div>
          <div className="text-xs text-green-600 font-semibold mt-1">Meses Pagados</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{vencidos}</div>
          <div className="text-xs text-red-600 font-semibold mt-1">Meses Vencidos</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">${totalPagado.toFixed(2)}</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">Total Cobrado</div>
        </div>
        <div className={`border rounded-xl p-4 text-center ${vencidos > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`text-2xl font-bold ${vencidos > 0 ? 'text-red-700' : 'text-gray-400'}`}>${montoVencido.toFixed(2)}</div>
          <div className={`text-xs font-semibold mt-1 ${vencidos > 0 ? 'text-red-600' : 'text-gray-400'}`}>Deuda Total</div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-200">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Pagado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Adelanto</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span> Pendiente</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Vencido</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span> En verificación</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span> Futuro</span>
        <span className="flex items-center gap-1.5 font-semibold">👆 Clic en pagado/verificación = ver comprobante</span>
      </div>

      {/* Cuadrícula de meses */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {mesesStatus.map(mes => {
          const c = ESTADO_CONFIG[mes.estado] || ESTADO_CONFIG.futuro;
          const hasReceipt = mes.transaccion?.comprobante_url;
          const isEnVerif = mes.estado === 'en_verificacion';
          const isRechazado = mes.estado === 'rechazado';
          const clickable = ['pagado','adelanto'].includes(mes.estado) || isEnVerif || isRechazado;
          const otrosMeses = mes.transaccion?.meses_cubiertos?.filter(x => x !== mes.codigo) || [];

          return (
            <div
              key={mes.codigo}
              onClick={() => clickable && handleCellClick(mes)}
              title={clickable ? (hasReceipt ? 'Clic para ver comprobante' : 'Sin comprobante adjunto') : ''}
              className={`border rounded-xl p-3 flex flex-col items-center gap-1 transition-all select-none ${c.bg} ${c.border} ${clickable ? c.ring : 'cursor-default'} ${mes.estado === 'futuro' ? 'opacity-50' : ''}`}
            >
              <span className={`material-symbols-outlined text-xl ${c.iconColor} ${isEnVerif ? 'animate-pulse' : ''}`}>{c.icon}</span>
              <span className="font-bold text-gray-700 text-sm">{mes.codigo}</span>
              <span className="text-[10px] text-gray-500">${mes.montoPension.toFixed(0)}</span>

              {/* Indicador de pago conjunto */}
              {otrosMeses.length > 0 && (
                <span className="text-[9px] text-center leading-tight bg-white/70 rounded px-1 py-0.5 text-gray-500 border border-gray-200">
                  +{otrosMeses.join('+')}
                </span>
              )}

              {/* Indicador de estado */}
              {clickable && (
                <span className={`text-[9px] flex items-center gap-0.5 ${
                  isEnVerif ? 'text-orange-600 font-bold' :
                  isRechazado ? 'text-rose-600 font-bold' :
                  hasReceipt ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <span className="material-symbols-outlined text-[10px]">
                    {isEnVerif ? 'hourglass_top' : isRechazado ? 'cancel' : hasReceipt ? 'receipt_long' : 'receipt'}
                  </span>
                  {isEnVerif ? 'Verificar' : isRechazado ? 'Rechazado' : hasReceipt ? 'Ver' : 'Sin comprobante'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Historial de transacciones */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Historial de Transacciones</h4>
        <div className="space-y-2">
          {(member.transacciones || []).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Sin transacciones registradas.</p>
          )}
          {(member.transacciones || []).map(txn => {
            const estadoVerif = txn.estado_verificacion;
            return (
              <div key={txn.id} className={`border rounded-xl px-4 py-3 ${
                estadoVerif === 'pendiente_verificacion' ? 'bg-orange-50 border-orange-200' :
                estadoVerif === 'rechazado' ? 'bg-rose-50 border-rose-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      estadoVerif === 'pendiente_verificacion' ? 'bg-orange-100' :
                      estadoVerif === 'rechazado' ? 'bg-rose-100' : 'bg-[#001f3f]/10'
                    }`}>
                      <span className={`material-symbols-outlined text-[16px] ${
                        estadoVerif === 'pendiente_verificacion' ? 'text-orange-500' :
                        estadoVerif === 'rechazado' ? 'text-rose-600' : 'text-[#001f3f]'
                      }`}>
                        {estadoVerif === 'pendiente_verificacion' ? 'hourglass_top' :
                         estadoVerif === 'rechazado' ? 'cancel' : 'receipt_long'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{txn.meses_cubiertos?.join(' + ')}</p>
                      <p className="text-xs text-gray-400">{txn.fecha_pago}{txn.notas ? ` · ${txn.notas}` : ''}</p>
                      {/* Badge estado verificación */}
                      {estadoVerif === 'pendiente_verificacion' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 mt-1">
                          <span className="material-symbols-outlined text-[10px] animate-pulse">hourglass_top</span>
                          Pendiente de verificación
                        </span>
                      )}
                      {estadoVerif === 'rechazado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 mt-1">
                          <span className="material-symbols-outlined text-[10px]">cancel</span>
                          Rechazado
                        </span>
                      )}
                      {(estadoVerif === 'aprobado' || !estadoVerif) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 mt-1">
                          <span className="material-symbols-outlined text-[10px]">verified</span>
                          {estadoVerif === 'aprobado' ? 'Aprobado' : 'Registrado'}
                        </span>
                      )}
                      {/* Badge estado factura */}
                      <FacturaBadge
                        estado={txn.estado_factura}
                        url_ride={txn.facturas?.url_ride}
                        onReintentar={() => handleReintentarFactura(txn)}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-800">${Number(txn.monto_real).toFixed(2)}</p>
                    {txn.comprobante_url && (
                      <button
                        onClick={() => setReceiptOpen({ transaccion: txn, mesCodigo: txn.meses_cubiertos?.[0] })}
                        className="text-[10px] text-blue-600 hover:underline">
                        Ver comprobante
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón registrar pago */}
      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={() => setRegisterOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#001f3f] text-white text-sm font-semibold hover:bg-blue-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Registrar Pago Manual
        </button>
      </div>

      {/* Sub-modales */}
      {receiptOpen && (
        <ReceiptViewer
          transaccion={receiptOpen.transaccion}
          mesCodigo={receiptOpen.mesCodigo}
          onClose={() => setReceiptOpen(null)}
          onAprobar={(txn) => handleVerificarPago(txn, 'aprobado', '')}
          onRechazar={(txn, nota) => handleVerificarPago(txn, 'rechazado', nota)}
        />
      )}
      {registerOpen && (
        <RegisterPaymentForm
          mesesStatus={mesesStatus}
          miembro={member}
          onSave={handleSavePago}
          onClose={() => setRegisterOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Tab Ficha ────────────────────────────────────────────────────────────────
function FichaTab({ member, onUpdateMember }) {
  const [isEditingAsignacion, setIsEditingAsignacion] = useState(false);
  const [asignacionData, setAsignacionData] = useState({
    entrenador_asignado: member.entrenador_asignado || '',
    grupo_horario: member.grupo_horario || ''
  });
  const [savingAsignacion, setSavingAsignacion] = useState(false);
  const [catalogos, setCatalogos] = useState({ entrenadores: [], horarios: [] });

  // ─── Edición ficha ────────────────────────────────────────────────────────
  const [isEditingFicha, setIsEditingFicha] = useState(false);
  const [fichaForm, setFichaForm] = useState({ ...member });
  const [savingFicha, setSavingFicha] = useState(false);

  const handleFichaChange = (e) => {
    const { name, value } = e.target;
    setFichaForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveFicha = async () => {
    setSavingFicha(true);
    try {
      const { data, error } = await supabase
        .from('miembros')
        .update({
          nombres:              fichaForm.nombres,
          cedula:               fichaForm.cedula,
          fecha_nacimiento:     fichaForm.fecha_nacimiento,
          genero:               fichaForm.genero,
          nacionalidad:         fichaForm.nacionalidad,
          direccion:            fichaForm.direccion,
          categoria:            fichaForm.categoria,
          discapacidad:         fichaForm.discapacidad,
          tipo_discapacidad:    fichaForm.tipo_discapacidad,
          porcentaje_discapacidad: fichaForm.porcentaje_discapacidad,
          nee:                  fichaForm.nee,
          usa_lentes:           fichaForm.usa_lentes,
          padre_nombres:        fichaForm.padre_nombres,
          padre_cedula:         fichaForm.padre_cedula,
          padre_telefono:       fichaForm.padre_telefono,
          padre_ocupacion:      fichaForm.padre_ocupacion,
          madre_nombres:        fichaForm.madre_nombres,
          madre_cedula:         fichaForm.madre_cedula,
          madre_telefono:       fichaForm.madre_telefono,
          madre_ocupacion:      fichaForm.madre_ocupacion,
          representante_legal:  fichaForm.representante_legal,
          facturacion_ruc:      fichaForm.facturacion_ruc,
          facturacion_nombre:   fichaForm.facturacion_nombre,
          facturacion_direccion: fichaForm.facturacion_direccion,
          facturacion_telefono: fichaForm.facturacion_telefono,
          facturacion_correo:   fichaForm.facturacion_correo,
        })
        .eq('id', member.id)
        .select()
        .single();
      if (error) throw error;
      if (onUpdateMember) onUpdateMember({ ...member, ...data });
      setIsEditingFicha(false);
    } catch (err) {
      console.error('Error guardando ficha:', err);
      alert('Error al guardar la ficha. Intenta de nuevo.');
    } finally {
      setSavingFicha(false);
    }
  };

  useEffect(() => {
    async function loadCatalogos() {
      const { data } = await supabase.from('config_club').select('entrenadores_lista, horarios_lista').maybeSingle();
      if (data) {
        setCatalogos({
          entrenadores: data.entrenadores_lista || [],
          horarios: data.horarios_lista || []
        });
      }
    }
    loadCatalogos();
  }, []);

  const handleSaveAsignacion = async () => {
    setSavingAsignacion(true);
    try {
      const { data, error } = await supabase
        .from('miembros')
        .update({
          entrenador_asignado: asignacionData.entrenador_asignado,
          grupo_horario: asignacionData.grupo_horario
        })
        .eq('id', member.id)
        .select()
        .single();
        
      if (error) throw error;
      if (onUpdateMember) onUpdateMember({ ...member, ...data });
      setIsEditingAsignacion(false);
    } catch (err) {
      console.error('Error guardando asignacion:', err);
      alert('Error al guardar asignación deportiva');
    } finally {
      setSavingAsignacion(false);
    }
  };

  return (
    <div className="p-6" id="ficha-print-area">
      <div className="flex justify-between items-center mb-4 print:hidden gap-2">
        <div className="flex gap-2">
          {isEditingFicha ? (
            <>
              <button onClick={() => { setIsEditingFicha(false); setFichaForm({ ...member }); }}
                disabled={savingFicha}
                className="px-3 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveFicha} disabled={savingFicha}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                {savingFicha ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[14px]">save</span>}
                {savingFicha ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditingFicha(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#001f3f] bg-white border border-[#001f3f]/30 rounded-lg hover:bg-[#001f3f]/5 transition-colors">
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
              Editar Ficha
            </button>
          )}
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          <span className="hidden sm:inline">Descargar PDF</span>
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6 pb-5 border-b-2 border-[#001f3f]">
        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
          {member.foto
            ? <img src={member.foto} alt="Foto" className="w-full h-full object-cover" />
            : <span className="material-symbols-outlined text-4xl text-gray-400">person</span>}
        </div>
        <div>
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Ficha de Matriculación — {member.categoria}</p>
          <h2 className="text-xl font-bold text-gray-800 mt-0.5">{member.nombres}</h2>
          <p className="text-sm text-gray-500">C.I.: {member.cedula} · Año Lectivo 2024–2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Asignación Deportiva (Nueva sección editable) */}
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 md:col-span-2 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-orange-200/50 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between mb-4 border-b border-orange-200/60 pb-2">
            <h4 className="flex items-center gap-2 text-sm font-bold text-orange-800 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">whistle</span> Asignación Deportiva
            </h4>
            <div className="print:hidden">
              {isEditingAsignacion ? (
                <div className="flex gap-2 relative z-10">
                  <button onClick={() => setIsEditingAsignacion(false)} disabled={savingAsignacion}
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button onClick={handleSaveAsignacion} disabled={savingAsignacion}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors flex items-center gap-1">
                    {savingAsignacion ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> : 'Guardar'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditingAsignacion(true)}
                  className="px-3 py-1.5 text-xs font-bold text-orange-700 bg-white border border-orange-300 rounded hover:bg-orange-100 transition-colors flex items-center gap-1 relative z-10">
                  <span className="material-symbols-outlined text-[14px]">edit</span> Asignar Grupo
                </button>
              )}
            </div>
          </div>

          {isEditingAsignacion ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-orange-900 mb-1">Entrenador Asignado</label>
                <input
                  type="text"
                  list="lista-entrenadores"
                  value={asignacionData.entrenador_asignado}
                  onChange={(e) => setAsignacionData({...asignacionData, entrenador_asignado: e.target.value})}
                  className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-500 bg-white"
                  placeholder="Selecciona o escribe..."
                />
                <datalist id="lista-entrenadores">
                  {catalogos.entrenadores.map((ent, i) => (
                    <option key={i} value={ent} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-orange-900 mb-1">Grupo y Horario</label>
                <input
                  type="text"
                  list="lista-horarios"
                  value={asignacionData.grupo_horario}
                  onChange={(e) => setAsignacionData({...asignacionData, grupo_horario: e.target.value})}
                  className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-orange-500 bg-white"
                  placeholder="Selecciona o escribe..."
                />
                <datalist id="lista-horarios">
                  {catalogos.horarios.map((hor, i) => (
                    <option key={i} value={hor} />
                  ))}
                </datalist>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-orange-700/80 uppercase tracking-wider mb-0.5">Entrenador Asignado</p>
                <p className="text-sm font-semibold text-gray-800">
                  {member.entrenador_asignado ? (
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span> {member.entrenador_asignado}</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-gray-500"><span className="material-symbols-outlined text-[16px]">pending</span> Pendiente de asignación</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-700/80 uppercase tracking-wider mb-0.5">Horario y Grupo</p>
                <p className="text-sm font-semibold text-gray-800">
                  {member.grupo_horario ? (
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span> {member.grupo_horario}</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-gray-500"><span className="material-symbols-outlined text-[16px]">pending</span> Pendiente de asignación</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Vista de lectura vs edición ── */}
        {isEditingFicha ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Modifica los campos necesarios y presiona «Guardar Cambios» cuando termines.
            </div>
            {/* Jugador */}
            <EditSection title="Datos del Jugador" icon="sports_volleyball">
              <EditField label="Nombres" name="nombres" value={fichaForm.nombres || ''} onChange={handleFichaChange} full />
              <EditField label="Cédula" name="cedula" value={fichaForm.cedula || ''} onChange={handleFichaChange} />
              <EditField label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={fichaForm.fecha_nacimiento || ''} onChange={handleFichaChange} />
              <EditField label="Género" name="genero" value={fichaForm.genero || ''} onChange={handleFichaChange} as="select" options={['Masculino','Femenino','Otro']} />
              <EditField label="Nacionalidad" name="nacionalidad" value={fichaForm.nacionalidad || ''} onChange={handleFichaChange} />
              <EditField label="Categoría" name="categoria" value={fichaForm.categoria || ''} onChange={handleFichaChange} as="select" options={['Mini','Pre-Mini','Infantil','Juvenil','Mayores']} />
              <EditField label="Dirección" name="direccion" value={fichaForm.direccion || ''} onChange={handleFichaChange} full />
            </EditSection>
            {/* Médica */}
            <EditSection title="Ficha Médica" icon="medical_information">
              <EditField label="Discapacidad" name="discapacidad" value={fichaForm.discapacidad || ''} onChange={handleFichaChange} as="select" options={['NO','SÍ']} />
              {fichaForm.discapacidad === 'SÍ' && <>
                <EditField label="Tipo" name="tipo_discapacidad" value={fichaForm.tipo_discapacidad || ''} onChange={handleFichaChange} />
                <EditField label="Porcentaje (%)" name="porcentaje_discapacidad" type="number" value={fichaForm.porcentaje_discapacidad || ''} onChange={handleFichaChange} />
              </>}
              <EditField label="NEE" name="nee" value={fichaForm.nee || ''} onChange={handleFichaChange} as="select" options={['NO','SÍ']} />
              <EditField label="Usa Lentes" name="usa_lentes" value={fichaForm.usa_lentes || ''} onChange={handleFichaChange} as="select" options={['NO','SÍ']} />
            </EditSection>
            {/* Padre */}
            <EditSection title="Datos del Padre" icon="person">
              <EditField label="Nombres" name="padre_nombres" value={fichaForm.padre_nombres || ''} onChange={handleFichaChange} full />
              <EditField label="Cédula" name="padre_cedula" value={fichaForm.padre_cedula || ''} onChange={handleFichaChange} />
              <EditField label="Teléfono" name="padre_telefono" value={fichaForm.padre_telefono || ''} onChange={handleFichaChange} />
              <EditField label="Ocupación" name="padre_ocupacion" value={fichaForm.padre_ocupacion || ''} onChange={handleFichaChange} />
            </EditSection>
            {/* Madre */}
            <EditSection title="Datos de la Madre" icon="person">
              <EditField label="Nombres" name="madre_nombres" value={fichaForm.madre_nombres || ''} onChange={handleFichaChange} full />
              <EditField label="Cédula" name="madre_cedula" value={fichaForm.madre_cedula || ''} onChange={handleFichaChange} />
              <EditField label="Teléfono" name="madre_telefono" value={fichaForm.madre_telefono || ''} onChange={handleFichaChange} />
              <EditField label="Ocupación" name="madre_ocupacion" value={fichaForm.madre_ocupacion || ''} onChange={handleFichaChange} />
            </EditSection>
            {/* Representante */}
            <EditSection title="Representante Legal" icon="verified_user">
              <EditField label="Es representante" name="representante_legal" value={fichaForm.representante_legal || ''} onChange={handleFichaChange} as="select" options={['Madre','Padre','Otro']} />
            </EditSection>
            {/* Facturación */}
            <EditSection title="Datos de Facturación" icon="receipt">
              <EditField label="Cédula / RUC" name="facturacion_ruc" value={fichaForm.facturacion_ruc || ''} onChange={handleFichaChange} />
              <EditField label="Razón Social" name="facturacion_nombre" value={fichaForm.facturacion_nombre || ''} onChange={handleFichaChange} full />
              <EditField label="Dirección" name="facturacion_direccion" value={fichaForm.facturacion_direccion || ''} onChange={handleFichaChange} full />
              <EditField label="Teléfono" name="facturacion_telefono" value={fichaForm.facturacion_telefono || ''} onChange={handleFichaChange} />
              <EditField label="Correo" name="facturacion_correo" value={fichaForm.facturacion_correo || ''} onChange={handleFichaChange} />
            </EditSection>
          </div>
        ) : (
          <>
            <Section title="Datos del Jugador" icon="sports_volleyball">
              <Field label="Nombres" value={member.nombres} full />
              <Field label="Cédula" value={member.cedula} />
              <Field label="Fecha de Nacimiento" value={member.fecha_nacimiento} />
              <Field label="Género" value={member.genero} />
              <Field label="Nacionalidad" value={member.nacionalidad} />
              <Field label="Dirección" value={member.direccion} full />
            </Section>
            <Section title="Ficha Médica" icon="medical_information">
              <Field label="Discapacidad" value={member.discapacidad} />
              {member.discapacidad === 'SÍ' && <>
                <Field label="Tipo" value={member.tipo_discapacidad} />
                <Field label="Porcentaje" value={`${member.porcentaje_discapacidad}%`} />
              </>}
              <Field label="NEE" value={member.nee} />
              <Field label="Usa Lentes" value={member.usa_lentes} />
            </Section>
            <Section title="Datos del Padre" icon="person">
              <Field label="Nombres" value={member.padre_nombres} full />
              <Field label="Cédula" value={member.padre_cedula} />
              <Field label="Teléfono" value={member.padre_telefono} />
              <Field label="Ocupación" value={member.padre_ocupacion} />
            </Section>
            <Section title="Datos de la Madre" icon="person">
              <Field label="Nombres" value={member.madre_nombres} full />
              <Field label="Cédula" value={member.madre_cedula} />
              <Field label="Teléfono" value={member.madre_telefono} />
              <Field label="Ocupación" value={member.madre_ocupacion} />
            </Section>
            <Section title="Representante Legal" icon="verified_user">
              <Field label="Es representante" value={member.representante_legal} />
              <Field label="Teléfono"
                value={member.representante_legal === 'Madre' ? member.madre_telefono : member.padre_telefono} />
            </Section>
            <Section title="Datos de Facturación" icon="receipt">
              <Field label="Cédula / RUC" value={member.facturacion_ruc} />
              <Field label="Razón Social" value={member.facturacion_nombre} full />
              <Field label="Dirección" value={member.facturacion_direccion} full />
              <Field label="Teléfono" value={member.facturacion_telefono} />
              <Field label="Correo" value={member.facturacion_correo} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
      <h4 className="flex items-center gap-2 text-sm font-bold text-[#001f3f] uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
        <span className="material-symbols-outlined text-[18px] text-orange-500">{icon}</span>{title}
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
    </div>
  );
}
function Field({ label, value, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
    </div>
  );
}
function EditSection({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h4 className="flex items-center gap-2 text-sm font-bold text-[#001f3f] uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
        <span className="material-symbols-outlined text-[18px] text-orange-500">{icon}</span>{title}
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  );
}
function EditField({ label, name, value, onChange, full, type = 'text', as, options }) {
  const cls = "w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all";
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {as === 'select' ? (
        <select name={name} value={value} onChange={onChange} className={cls}>
          <option value="">—</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className={cls} />
      )}
    </div>
  );
}

// ─── Modal Principal ──────────────────────────────────────────────────────────
export default function MemberModal({ member: initialMember, onClose, onDelete }) {
  const [tab, setTab] = useState('pagos');
  const [member, setMember] = useState(initialMember);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('miembros').delete().eq('id', member.id);
      if (error) throw error;
      if (onDelete) onDelete(member.id);
      onClose();
    } catch (err) {
      console.error('Error eliminando miembro:', err);
      alert('No se pudo eliminar el jugador. Intenta de nuevo.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!member) return null;

  const mesesStatus = derivarEstadoMeses(member.transacciones);
  const vencidos = mesesStatus.filter(m => m.estado === 'vencido').length;
  const alDia = vencidos === 0;

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#member-modal-root) { display: none !important; }
          #member-modal-root .print\\:hidden { display: none !important; }
          #member-modal-root { position: static !important; background: white !important; overflow: visible !important; }
        }
      `}</style>

      <div id="member-modal-root"
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#001f3f] rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">person</span>
              </div>
              <div>
                <h2 className="font-bold text-white text-sm leading-tight">{member.nombres}</h2>
                <p className="text-blue-200 text-xs">{member.categoria} · C.I. {member.cedula}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${alDia ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-red-900/40 text-red-300 border-red-700'}`}>
                {alDia ? '✓ Al día' : `⚠ ${vencidos} mes${vencidos > 1 ? 'es' : ''} vencido${vencidos > 1 ? 's' : ''}`}
              </span>
              <button onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg hover:bg-red-900/40 transition-colors text-red-300 hover:text-red-200"
                title="Eliminar jugador">
                <span className="material-symbols-outlined">person_remove</span>
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>

            {/* Diálogo de confirmación de eliminación */}
            {confirmDelete && (
              <div className="absolute top-full left-0 right-0 z-[60] bg-red-900 text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">¿Eliminar a {member.nombres}?</p>
                  <p className="text-xs text-red-200 mt-0.5">Esta acción no se puede deshacer. El jugador será removido del sistema.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="px-4 py-1.5 text-xs font-bold bg-red-500 hover:bg-red-400 rounded-lg transition-colors flex items-center gap-1.5">
                    {deleting ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[14px]">delete_forever</span>}
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            {[
              { id: 'pagos',  label: 'Control de Pagos', icon: 'payments' },
              { id: 'ficha',  label: 'Ficha Completa',   icon: 'badge' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                {t.label}
                {t.id === 'pagos' && vencidos > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{vencidos}</span>
                )}
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div className="overflow-y-auto flex-1">
            {tab === 'pagos' && <PagosTab member={member} onUpdateMember={setMember} />}
            {tab === 'ficha' && <FichaTab member={member} onUpdateMember={setMember} />}
          </div>
        </div>
      </div>
    </>
  );
}
