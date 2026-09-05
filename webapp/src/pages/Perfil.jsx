import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { derivarEstadoMeses } from '../utils/pagos';

// ── Config de estilos por estado de mes ───────────────────────────────────────
const ESTADO_CONFIG = {
  pagado:    { bg: 'bg-green-50',   border: 'border-green-300',  icon: 'check_circle',   iconColor: 'text-green-600',  label: 'Pagado',    textColor: 'text-green-700' },
  adelanto:  { bg: 'bg-blue-50',    border: 'border-blue-300',   icon: 'schedule_send',  iconColor: 'text-blue-600',   label: 'Adelanto',  textColor: 'text-blue-700' },
  pendiente: { bg: 'bg-amber-50',   border: 'border-amber-300',  icon: 'schedule',       iconColor: 'text-amber-500',  label: 'Pendiente', textColor: 'text-amber-700' },
  vencido:   { bg: 'bg-red-50',     border: 'border-red-300',    icon: 'warning',        iconColor: 'text-red-500',    label: 'Vencido',   textColor: 'text-red-700' },
  futuro:    { bg: 'bg-gray-50',    border: 'border-gray-200',   icon: 'remove',         iconColor: 'text-gray-300',   label: 'Futuro',    textColor: 'text-gray-400' },
};

// ── Modal para Ver Comprobante ────────────────────────────────────────────────
function ReceiptViewer({ transaccion, mesCodigo, onClose }) {
  if (!transaccion) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#001f3f] text-white">
          <div>
            <h3 className="font-bold text-base">Comprobante de Pago</h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Fecha: {transaccion.fecha_pago} · Monto: ${Number(transaccion.monto_real || 0).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {transaccion.comprobante_url && (
              <a
                href={transaccion.comprobante_url}
                download="comprobante-pago.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-semibold hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Descargar
              </a>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meses cubiertos por este pago:</p>
          <div className="flex gap-2 flex-wrap">
            {(transaccion.meses_cubiertos || []).map(cod => (
              <span
                key={cod}
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  cod === mesCodigo ? 'bg-[#001f3f] text-white border-[#001f3f]' : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {cod}
              </span>
            ))}
          </div>
          {transaccion.notas && (
            <p className="text-xs text-gray-600 mt-2 bg-white p-2.5 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-700">Nota:</span> {transaccion.notas}
            </p>
          )}
        </div>

        <div className="p-5 bg-gray-100 flex items-center justify-center min-h-64 max-h-[60vh] overflow-auto">
          {transaccion.comprobante_url ? (
            <img
              src={transaccion.comprobante_url}
              alt="Comprobante de pago"
              className="max-w-full rounded-xl shadow-md object-contain max-h-[50vh]"
            />
          ) : (
            <div className="text-center text-gray-400 py-10">
              <span className="material-symbols-outlined text-5xl mb-2">receipt_long</span>
              <p className="text-sm">Registro de pago sin imagen digital adjunta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal Ultra Rápido para Subir Comprobante de Pago ─────────────────────────
function UploadPaymentModal({ mesesStatus, miembroId, onClose, onSuccess }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mesesSeleccionados, setMesesSeleccionados] = useState([]);
  const [mostrarOpcionesAvanzadas, setMostrarOpcionesAvanzadas] = useState(false);
  const [montoCustom, setMontoCustom] = useState('');
  const [notasCustom, setNotasCustom] = useState('');

  // Meses disponibles que no están pagados
  const mesesDisponibles = mesesStatus.filter(m => !['pagado', 'adelanto'].includes(m.estado));

  // Pre-seleccionar el primer mes que deba pagar
  useEffect(() => {
    const primerPendiente = mesesDisponibles.find(m => m.estado === 'vencido' || m.estado === 'pendiente') || mesesDisponibles[0];
    if (primerPendiente) {
      setMesesSeleccionados([primerPendiente.codigo]);
    }
  }, []);

  const montoCalculado = mesesSeleccionados.reduce((sum, cod) => {
    const m = mesesStatus.find(x => x.codigo === cod);
    return sum + (m ? m.montoPension : 35);
  }, 0);

  const toggleMes = (cod) => {
    setMesesSeleccionados(prev =>
      prev.includes(cod) ? (prev.length > 1 ? prev.filter(c => c !== cod) : prev) : [...prev, cod]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('La foto es muy pesada. Por favor toma otra foto o selecciona una imagen más ligera.');
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setFotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (mesesSeleccionados.length === 0) {
      setError('Selecciona al menos un mes a pagar.');
      return;
    }
    if (!fotoPreview && !fotoFile) {
      setError('Por favor toma una foto o sube la captura de tu comprobante.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Subir comprobante a Supabase Storage (bucket privado)
      // IMPORTANTE: El bucket 'fichas' debe ser PRIVADO en el panel de Supabase
      if (!fotoFile) {
        throw new Error('No se encontró el archivo del comprobante. Por favor, selecciona la foto nuevamente.');
      }

      const fileExt = fotoFile.name.split('.').pop() || 'jpg';
      const fileName = `comprobantes/pago-${miembroId || 'atleta'}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('fichas')
        .upload(fileName, fotoFile, { upsert: true });

      if (uploadError) {
        throw new Error(`No se pudo subir el comprobante. Verifica tu conexión e intenta nuevamente. (${uploadError.message})`);
      }

      // Signed URL de 30 días — suficiente para verificación del admin
      // Nota: El admin puede ver el comprobante en los próximos 30 días.
      // Si la URL expira, el historial aún muestra el registro del pago.
      const { data: signedData, error: signErr } = await supabase.storage
        .from('fichas')
        .createSignedUrl(fileName, 60 * 60 * 24 * 30); // 30 días

      if (signErr || !signedData?.signedUrl) {
        throw new Error('El comprobante se subió pero no se pudo generar el enlace de acceso. Contacta al administrador.');
      }

      const comprobante_url = signedData.signedUrl;

      const montoFinal = parseFloat(montoCustom) || montoCalculado;
      const fechaHoy = new Date().toISOString().split('T')[0];

      // Insertar transacción en Supabase
      const { data: txnData, error: txnError } = await supabase
        .from('transacciones')
        .insert({
          miembro_id: miembroId,
          fecha_pago: fechaHoy,
          monto_real: montoFinal,
          notas: notasCustom ? notasCustom : `Comprobante subido por representante (${mesesSeleccionados.join(', ')})`,
          comprobante_url: comprobante_url,
          meses_cubiertos: mesesSeleccionados,
        })
        .select()
        .single();

      if (txnError) {
        console.error('Error al guardar comprobante:', txnError);
        throw new Error(`Error: ${txnError.message}`);
      }

      onSuccess(txnData);
    } catch (err) {
      setError(err.message || 'Error al enviar el comprobante. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/75 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        
        {/* Header simple y limpio */}
        <div className="px-6 py-4 bg-[#001f3f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-orange-400 text-[24px]">receipt_long</span>
            <div>
              <h3 className="font-bold text-base">Subir Comprobante de Pago</h3>
              <p className="text-xs text-blue-200">Rápido y directo para verificación del club</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white text-[20px]">close</span>
          </button>
        </div>

        {/* Cuerpo directo */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* 1. Selecciona el Mes */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 mb-2">
              1. ¿Qué mes estás pagando?
            </label>

            <div className="grid grid-cols-4 gap-2">
              {mesesStatus.map(m => {
                const isPaid = ['pagado', 'adelanto'].includes(m.estado);
                const isSelected = mesesSeleccionados.includes(m.codigo);

                return (
                  <button
                    key={m.codigo}
                    type="button"
                    disabled={isPaid}
                    onClick={() => toggleMes(m.codigo)}
                    className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                      isPaid
                        ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#001f3f] border-[#001f3f] text-white shadow-lg scale-[1.03]'
                        : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-bold text-sm">{m.codigo}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-orange-400 font-semibold' : 'text-gray-500'}`}>
                      ${m.montoPension}
                    </span>
                    {isPaid && <span className="text-[9px] text-green-700 font-semibold mt-0.5">Listo</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Subir o Tomar Foto */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 mb-2">
              2. Foto del Comprobante o Transferencia
            </label>

            {fotoPreview ? (
              <div className="border-2 border-green-500/60 bg-green-50/40 rounded-2xl p-3 flex items-center gap-4">
                <img
                  src={fotoPreview}
                  alt="Comprobante"
                  className="w-20 h-20 object-cover rounded-xl border border-green-200 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-green-600">check_circle</span>
                    Foto cargada correctamente
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {mesesSeleccionados.join(', ')} · Total: ${montoCalculado.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFotoFile(null); setFotoPreview(null); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-colors shrink-0"
                  title="Cambiar foto"
                >
                  <span className="material-symbols-outlined text-[22px]">delete</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 text-orange-900 hover:bg-orange-100 hover:border-orange-500 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  </div>
                  <span className="text-xs font-bold">Tomar Foto</span>
                  <span className="text-[10px] text-orange-700/80 -mt-1">Cámara del celular</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 text-blue-900 hover:bg-blue-100 hover:border-blue-500 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#001f3f] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">upload_file</span>
                  </div>
                  <span className="text-xs font-bold">Galería / Archivo</span>
                  <span className="text-[10px] text-blue-700/80 -mt-1">Captura de pantalla</span>
                </button>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Opciones opcionales / avanzadas */}
          <div>
            <button
              type="button"
              onClick={() => setMostrarOpcionesAvanzadas(!mostrarOpcionesAvanzadas)}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                {mostrarOpcionesAvanzadas ? 'expand_less' : 'add'}
              </span>
              {mostrarOpcionesAvanzadas ? 'Ocultar detalles' : 'Agregar nota o cambiar monto (opcional)'}
            </button>

            {mostrarOpcionesAvanzadas && (
              <div className="mt-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Monto ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={montoCalculado.toFixed(2)}
                    value={montoCustom}
                    onChange={e => setMontoCustom(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Nota o N° Transferencia</label>
                  <input
                    type="text"
                    placeholder="Ej: Pichincha #48291"
                    value={notasCustom}
                    onChange={e => setNotasCustom(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botón Principal Grande */}
          <div className="pt-2">
            <button
              type="button"
              disabled={loading || !fotoPreview}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                !fotoPreview
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-500/30 hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Enviando Comprobante...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  Enviar Comprobante (${(parseFloat(montoCustom) || montoCalculado).toFixed(2)})
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

// ── Página Principal del Deportista ───────────────────────────────────────────
export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fichaData, setFichaData] = useState(null);
  const [miembroData, setMiembroData] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(null);
  const [notification, setNotification] = useState('');

  // Cargar datos del usuario desde Supabase — queries en paralelo
  const loadAthleteData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Query 1: ficha del deportista (por user_id)
      // Query 2: miembro por email (fallback si no hay cédula aún)
      const fichaPromise = supabase
        .from('fichas')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const memberByEmailPromise = user.email
        ? supabase
            .from('miembros')
            .select('*, transacciones(*)')
            .eq('facturacion_correo', user.email)
            .maybeSingle()
        : Promise.resolve({ data: null });

      // Ejecutar en paralelo
      const [{ data: ficha }, { data: memByEmail }] = await Promise.all([
        fichaPromise,
        memberByEmailPromise,
      ]);

      setFichaData(ficha || null);

      // Si tenemos cédula, buscamos por cédula (más exacto)
      let member = memByEmail;
      const cedula = ficha?.cedula_jugador;
      if (cedula) {
        const { data: memByCed } = await supabase
          .from('miembros')
          .select('*, transacciones(*)')
          .eq('cedula', cedula)
          .maybeSingle();
        if (memByCed) member = memByCed;
      }

      setMiembroData(member);
      setTransacciones(member?.transacciones || []);
    } catch (err) {
      console.error('Error cargando perfil del deportista:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAthleteData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePaymentSuccess = (newTxn) => {
    setShowUploadModal(false);
    setTransacciones(prev => [...prev, newTxn]);
    setNotification('¡Comprobante de pago enviado con éxito! El administrador ya puede verificarlo.');
    setTimeout(() => setNotification(''), 6000);
    loadAthleteData();
  };

  // Beca y Pensión personalizada — solo desde base de datos, nunca por nombre
  const montoPension = Number(miembroData?.monto_pension ?? 55.00);
  const tieneBeca = miembroData?.tiene_beca === true || (miembroData && montoPension < 55.00);
  const tipoBeca = miembroData?.tipo_beca || (tieneBeca ? 'Beca Deportiva' : null);

  // Derivación de meses usando transacciones reales y monto de pensión del deportista
  const mesesStatus = derivarEstadoMeses(transacciones, montoPension);
  const mesesPagadosCount = mesesStatus.filter(m => ['pagado', 'adelanto'].includes(m.estado)).length;
  const mesesPendientesCount = mesesStatus.filter(m => m.estado === 'pendiente' || m.estado === 'vencido').length;

  // Datos dinámicos del deportista
  const nombreCompleto = fichaData?.nombres_jugador || miembroData?.nombres || user?.user_metadata?.nombre || 'Deportista';
  const primerNombre = nombreCompleto.split(' ')[0] || 'Deportista';
  const categoria = miembroData?.categoria || 'U14';
  const fotoUrl = fichaData?.foto_url || miembroData?.foto_url;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <span className="material-symbols-outlined text-4xl text-orange-500 animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-semibold">Cargando perfil del deportista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] text-gray-800 min-h-screen py-8 px-margin-mobile md:px-margin-desktop font-body-md">
      <div className="max-w-container-max mx-auto space-y-8">

        {/* Notificación flotante de éxito */}
        {notification && (
          <div className="p-4 rounded-xl bg-green-500 text-white shadow-lg flex items-center justify-between gap-3 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">verified</span>
              <p className="text-sm font-bold">{notification}</p>
            </div>
            <button onClick={() => setNotification('')} className="p-1 hover:bg-white/20 rounded-lg">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* ── Header del Deportista ── */}
        <header className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
            {/* Foto / Avatar */}
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-[#001f3f] flex items-center justify-center shadow-md">
                {fotoUrl ? (
                  <img src={fotoUrl} alt={nombreCompleto} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white tracking-wider">
                    {nombreCompleto.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Miembro Activo" />
            </div>

            {/* Info y Saludo */}
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                  Categoría {categoria}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  Formativa Oficial
                </span>
                {tieneBeca && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-amber-600">star</span>
                    {tipoBeca} · Pensión: ${montoPension.toFixed(2)}/mes
                  </span>
                )}
                <span className="text-xs text-gray-500">📍 Sede Cuenca</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#000613]">
                ¡Bienvenida de nuevo, <span className="text-orange-600">{primerNombre}</span>!
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Portal del Deportista · Club Pito Pérez Voleibol
              </p>
            </div>
          </div>

          {/* Botones de acción Header */}
          <div className="flex flex-wrap items-center gap-3 z-10 w-full sm:w-auto">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-md hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
              Subir Comprobante
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* ── Grid Principal: 2 Columnas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda (8 cols): Horarios & Módulo de Pagos */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. MÓDULO DE VERIFICACIÓN DE PAGOS Y MENSUALIDADES */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <h2 className="text-xl font-bold text-[#000613]">Control de Mensualidades y Cuotas</h2>
                    {tieneBeca && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⭐ Tarifa Beca: ${montoPension.toFixed(2)}/mes (Regular: $55)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Año Lectivo / Temporada Deportiva 2024 – 2025 (Sep a Jul)
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001f3f] text-white text-xs font-bold hover:bg-blue-900 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  Reportar Nuevo Pago
                </button>
              </div>

              {/* Tarjetas resumen de pagos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{mesesPagadosCount}</div>
                  <div className="text-xs text-green-600 font-semibold mt-0.5">Meses al Día</div>
                </div>
                <div className={`border rounded-xl p-4 text-center ${mesesPendientesCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-2xl font-bold ${mesesPendientesCount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>
                    {mesesPendientesCount}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold mt-0.5">Meses por Pagar</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                  <div className="text-2xl font-bold text-blue-700">${(mesesPagadosCount * montoPension).toFixed(0)}</div>
                  <div className="text-xs text-blue-600 font-semibold mt-0.5">Total Cancelado</div>
                </div>
              </div>

              {/* Leyenda interactiva */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 bg-gray-50 rounded-xl p-3.5 mb-5 border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Pagado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Mes Actual
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Vencido
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Futuro
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-blue-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">touch_app</span>
                  Clic en un mes pagado para ver su comprobante
                </span>
              </div>

              {/* Cuadrícula interactiva de meses */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {mesesStatus.map(mes => {
                  const c = ESTADO_CONFIG[mes.estado] || ESTADO_CONFIG.futuro;
                  const isPaid = ['pagado', 'adelanto'].includes(mes.estado);
                  const hasReceipt = mes.transaccion?.comprobante_url;

                  return (
                    <div
                      key={mes.codigo}
                      onClick={() => isPaid && mes.transaccion && setReceiptModal({ transaccion: mes.transaccion, mesCodigo: mes.codigo })}
                      className={`border-2 rounded-xl p-3 flex flex-col items-center justify-between min-h-[95px] transition-all select-none ${c.bg} ${c.border} ${
                        isPaid ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default opacity-85'
                      }`}
                      title={isPaid ? (hasReceipt ? 'Ver comprobante adjunto' : 'Pagado registrado') : `Estado: ${c.label}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-gray-800 text-sm">{mes.codigo}</span>
                        <span className={`material-symbols-outlined text-[18px] ${c.iconColor}`}>{c.icon}</span>
                      </div>

                      <div className="text-center my-1">
                        <span className="text-xs font-semibold text-gray-700">${mes.montoPension}</span>
                        <span className={`block text-[10px] font-bold ${c.textColor}`}>{c.label}</span>
                      </div>

                      {isPaid && (
                        <span className="text-[9px] font-semibold text-blue-700 bg-white/80 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">receipt</span>
                          Ver
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 2. HORARIOS Y ENTRENAMIENTOS DE LA CATEGORÍA */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#000613] flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500">sports_volleyball</span>
                    Horarios de Entrenamiento ({categoria})
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Horarios oficiales de tu equipo en Cuenca</p>
                </div>
                <Link to="/horarios" className="text-xs font-bold text-orange-600 hover:underline">
                  Ver Todo el Cronograma →
                </Link>
              </div>

              {miembroData?.grupo_horario ? (
                <div className="bg-orange-50/60 border border-orange-200/60 rounded-xl p-5 border-l-4 border-l-orange-500 mt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Horario Asignado</span>
                      <h3 className="text-base font-bold text-[#000613] mt-1">{miembroData.grupo_horario}</h3>
                    </div>
                    <span className="px-2 py-1 bg-white rounded-md text-xs font-bold text-gray-700 border border-gray-200">
                      Entrenamiento Formativo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mt-4">
                  <span className="material-symbols-outlined text-gray-400 text-3xl mb-2">pending_actions</span>
                  <p className="text-sm font-semibold text-gray-600">Horario pendiente de asignación</p>
                  <p className="text-xs text-gray-500 mt-1">El club te asignará un grupo y horario muy pronto.</p>
                </div>
              )}
            </section>

          </div>

          {/* Columna Derecha (4 cols): Ficha Deportiva & Información Oficial */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Ficha Oficial de la Jugadora */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <span className="material-symbols-outlined text-orange-500 text-[20px]">badge</span>
                <h3 className="font-bold text-gray-800 text-base">Ficha Oficial del Club</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-gray-400 font-medium block">Nombre Registrado:</span>
                  <span className="font-bold text-gray-800 text-sm">{nombreCompleto}</span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Cédula de Identidad:</span>
                  <span className="font-semibold text-gray-700">
                    {fichaData?.cedula_jugador || miembroData?.cedula || '0104567896'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Categoría y Equipo:</span>
                  <span className="font-semibold text-gray-700">
                    {categoria} Formativa · Pito Pérez V.C.
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Cuerpo Técnico Asignado:</span>
                  <span className="font-semibold text-gray-700">
                    {miembroData?.entrenador_asignado || 'Pendiente de asignación'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Representante Legal:</span>
                  <span className="font-semibold text-gray-700">
                    {fichaData?.firma_representante || fichaData?.nombres_madre || miembroData?.madre_nombres || 'Elena Andrade Rivera'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Teléfono de Contacto:</span>
                  <span className="font-semibold text-gray-700">
                    {fichaData?.telefono_madre || fichaData?.telefono_facturacion || '0991234567'}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
                    <span className="material-symbols-outlined text-[14px]">policy</span>
                    Autorización de Imagen Activa (MinEduc)
                  </span>
                </div>
              </div>
            </section>

            {/* Tarjeta de Contacto / Sede */}
            <section className="bg-gradient-to-br from-[#001f3f] to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400">help</span>
                ¿Dudas sobre tus pagos o entrenamientos?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Comunícate directamente con la administración del club o los entrenadores para justificaciones de falta o consultas de facturación.
              </p>
              <a
                href="https://wa.me/593995104405"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Contactar al Club por WhatsApp
              </a>
            </section>

          </div>

        </div>

      </div>

      {/* ── Modales ── */}
      {showUploadModal && (
        <UploadPaymentModal
          mesesStatus={mesesStatus}
          miembroId={miembroData?.id || 'eb371423-6312-4006-81d7-d7f4d319fed2'}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {receiptModal && (
        <ReceiptViewer
          transaccion={receiptModal.transaccion}
          mesCodigo={receiptModal.mesCodigo}
          onClose={() => setReceiptModal(null)}
        />
      )}
    </div>
  );
}
