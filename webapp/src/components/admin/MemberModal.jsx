import { useState, useRef } from 'react';
import { derivarEstadoMeses } from '../../utils/pagos';

// ─── Config de estilos por estado ────────────────────────────────────────────
const ESTADO_CONFIG = {
  pagado:    { bg: 'bg-green-50',   border: 'border-green-300',  icon: 'check_circle', iconColor: 'text-green-600',  label: 'Pagado',    ring: 'hover:ring-2 hover:ring-green-400 cursor-pointer' },
  adelanto:  { bg: 'bg-blue-50',    border: 'border-blue-300',   icon: 'schedule_send', iconColor: 'text-blue-600',  label: 'Adelanto',  ring: 'hover:ring-2 hover:ring-blue-400 cursor-pointer' },
  pendiente: { bg: 'bg-amber-50',   border: 'border-amber-300',  icon: 'schedule',     iconColor: 'text-amber-500',  label: 'Pendiente', ring: '' },
  vencido:   { bg: 'bg-red-50',     border: 'border-red-300',    icon: 'warning',      iconColor: 'text-red-500',    label: 'Vencido',   ring: '' },
  futuro:    { bg: 'bg-gray-50',    border: 'border-gray-200',   icon: 'remove',       iconColor: 'text-gray-300',   label: '—',         ring: '' },
};

// ─── Visor de Comprobante ─────────────────────────────────────────────────────
function ReceiptViewer({ transaccion, mesCodigo, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-800">Comprobante de Pago</h3>
            <p className="text-xs text-gray-500 mt-0.5">Fecha: {transaccion.fecha_pago} · ${Number(transaccion.monto_real).toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={transaccion.comprobante_url} download target="_blank" rel="noreferrer"
               className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span> Descargar
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-gray-500">close</span>
            </button>
          </div>
        </div>

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
          <img src={transaccion.comprobante_url} alt="Comprobante"
               className="max-w-full rounded-lg shadow object-contain max-h-80" />
        </div>
      </div>
    </div>
  );
}

// ─── Formulario de Registro de Pago ──────────────────────────────────────────
function RegisterPaymentForm({ mesesStatus, onSave, onClose }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [notas, setNotas] = useState('');
  const [montoReal, setMontoReal] = useState('');
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);

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
      fecha_pago: fecha.split('-').reverse().join('/'),
      monto_real: parseFloat(montoReal) || montoCalculado,
      notas,
      comprobante_url: preview,
      meses_cubiertos: mesesSeleccionados,
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
                <div className="grid grid-cols-3 gap-2">
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

  const mesesStatus = derivarEstadoMeses(member.transacciones);
  const pagados    = mesesStatus.filter(m => ['pagado','adelanto'].includes(m.estado)).length;
  const vencidos   = mesesStatus.filter(m => m.estado === 'vencido').length;
  const adelantos  = mesesStatus.filter(m => m.estado === 'adelanto').length;
  const totalPagado = (member.transacciones || []).reduce((s, t) => s + Number(t.monto_real || 0), 0);
  const montoVencido = mesesStatus.filter(m => m.estado === 'vencido').reduce((s, m) => s + m.montoPension, 0);

  const handleSavePago = (nuevaTxn) => {
    const updatedMember = {
      ...member,
      transacciones: [...(member.transacciones || []), nuevaTxn]
    };
    onUpdateMember(updatedMember);
    setRegisterOpen(false);
  };

  const handleCellClick = (mes) => {
    if (!mes.transaccion) return;
    if (!mes.transaccion.comprobante_url) {
      alert('Este pago no tiene comprobante adjunto.');
      return;
    }
    setReceiptOpen({ transaccion: mes.transaccion, mesCodigo: mes.codigo });
  };

  return (
    <div className="p-6 space-y-6">
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
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Pagado por adelantado</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span> Mes actual (pendiente)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Vencido sin pagar</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span> Mes futuro</span>
        <span className="flex items-center gap-1.5 font-semibold">👆 Clic en pagado = ver comprobante</span>
      </div>

      {/* Cuadrícula de meses */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {mesesStatus.map(mes => {
          const c = ESTADO_CONFIG[mes.estado];
          const hasReceipt = mes.transaccion?.comprobante_url;
          const clickable = ['pagado','adelanto'].includes(mes.estado);
          const otrosMeses = mes.transaccion?.meses_cubiertos?.filter(x => x !== mes.codigo) || [];

          return (
            <div
              key={mes.codigo}
              onClick={() => clickable && handleCellClick(mes)}
              title={clickable ? (hasReceipt ? 'Clic para ver comprobante' : 'Sin comprobante adjunto') : ''}
              className={`border rounded-xl p-3 flex flex-col items-center gap-1 transition-all select-none ${c.bg} ${c.border} ${clickable ? c.ring : 'cursor-default'} ${mes.estado === 'futuro' ? 'opacity-50' : ''}`}
            >
              <span className={`material-symbols-outlined text-xl ${c.iconColor}`}>{c.icon}</span>
              <span className="font-bold text-gray-700 text-sm">{mes.codigo}</span>
              <span className="text-[10px] text-gray-500">${mes.montoPension.toFixed(0)}</span>

              {/* Indicador de pago conjunto */}
              {otrosMeses.length > 0 && (
                <span className="text-[9px] text-center leading-tight bg-white/70 rounded px-1 py-0.5 text-gray-500 border border-gray-200">
                  +{otrosMeses.join('+')}
                </span>
              )}

              {/* Indicador de comprobante */}
              {clickable && (
                <span className={`text-[9px] flex items-center gap-0.5 ${hasReceipt ? 'text-blue-600' : 'text-gray-400'}`}>
                  <span className="material-symbols-outlined text-[10px]">
                    {hasReceipt ? 'receipt_long' : 'receipt'}
                  </span>
                  {hasReceipt ? 'Ver' : 'Sin comprobante'}
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
          {(member.transacciones || []).map(txn => (
            <div key={txn.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#001f3f]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-[#001f3f]">receipt_long</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{txn.meses_cubiertos?.join(' + ')}</p>
                  <p className="text-xs text-gray-400">{txn.fecha_pago}{txn.notas ? ` · ${txn.notas}` : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${Number(txn.monto_real).toFixed(2)}</p>
                {txn.comprobante_url && (
                  <button
                    onClick={() => setReceiptOpen({ transaccion: txn, mesCodigo: txn.meses_cubiertos[0] })}
                    className="text-[10px] text-blue-600 hover:underline">
                    Ver comprobante
                  </button>
                )}
              </div>
            </div>
          ))}
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
        />
      )}
      {registerOpen && (
        <RegisterPaymentForm
          mesesStatus={mesesStatus}
          onSave={handleSavePago}
          onClose={() => setRegisterOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Tab Ficha ────────────────────────────────────────────────────────────────
function FichaTab({ member }) {
  return (
    <div className="p-6" id="ficha-print-area">
      <div className="flex justify-end mb-4 print:hidden">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          Descargar Ficha PDF
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

// ─── Modal Principal ──────────────────────────────────────────────────────────
export default function MemberModal({ member: initialMember, onClose }) {
  const [tab, setTab] = useState('pagos');
  const [member, setMember] = useState(initialMember);

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#001f3f] rounded-t-2xl">
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
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>
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
            {tab === 'ficha' && <FichaTab member={member} />}
          </div>
        </div>
      </div>
    </>
  );
}
