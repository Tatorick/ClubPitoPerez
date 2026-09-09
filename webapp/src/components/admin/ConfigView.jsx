import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ENTRENADORES_PREDETERMINADOS, HORARIOS_PREDETERMINADOS } from '../../data/horariosData';

// ── Componente de campo de formulario reutilizable ────────────────────────────
function ConfigField({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 leading-tight">{hint}</p>}
      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 transition-all";
const inputErrCls = "w-full px-3 py-2.5 border border-red-400 rounded-lg text-sm text-gray-800 bg-red-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all";

// ── Panel Principal de Configuración ─────────────────────────────────────────
export default function ConfigView() {
  const [activeTab, setActiveTab] = useState('club');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef(null);

  const [configId, setConfigId] = useState(null);
  const [form, setForm] = useState({
    razon_social: '',
    ruc: '',
    nombre_comercial: '',
    direccion_matriz: '',
    contribuyente_especial: '',
    obligado_contabilidad: 'NO',
    telefono: '',
    email_club: '',
    logo_url: '',
    facturero_user: '',
    facturero_password: '',
    facturero_ambiente: 'pruebas',
    facturero_producto_id: '',
    cod_establecimiento: '001',
    cod_punto_emision: '001',
    tarifa_iva: '0',
    precio_pension: '55.00',
  });

  const [entrenadores, setEntrenadores] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [syncingCronograma, setSyncingCronograma] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [nuevoEntrenador, setNuevoEntrenador] = useState('');
  const [nuevoHorario, setNuevoHorario] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('config_club').select('*').maybeSingle();
      if (!error && data) {
        if (data.id) setConfigId(data.id);
        setForm(prev => ({
          ...prev,
          razon_social:               data.razon_social || '',
          ruc:                        data.ruc || '',
          nombre_comercial:           data.nombre_comercial || '',
          direccion_matriz:           data.direccion_matriz || '',
          contribuyente_especial:     data.contribuyente_especial || '',
          obligado_contabilidad:      data.obligado_contabilidad || 'NO',
          telefono:                   data.telefono || '',
          email_club:                 data.email_club || '',
          logo_url:                   data.logo_url || '',
          facturero_user:             data.facturero_user || '',
          facturero_password:         data.facturero_password || '',
          facturero_ambiente:         data.facturero_ambiente || 'pruebas',
          facturero_producto_id:      data.facturero_producto_id || '',
          cod_establecimiento:        data.cod_establecimiento || '001',
          cod_punto_emision:          data.cod_punto_emision || '001',
          tarifa_iva:                 data.tarifa_iva || '0',
          precio_pension:             data.precio_pension || '55.00',
        }));
      }

      const [{ data: ents }, { data: hors }] = await Promise.all([
        supabase.from('entrenadores').select('*').order('id'),
        supabase.from('horarios').select('*').order('id')
      ]);

      let entsFinal = ents;
      if (!entsFinal || entsFinal.length === 0) {
        try {
          const toInsert = ENTRENADORES_PREDETERMINADOS.map(nombre => ({ nombre }));
          const { data: seeded } = await supabase.from('entrenadores').insert(toInsert).select();
          entsFinal = seeded && seeded.length > 0 ? seeded : toInsert.map((e, idx) => ({ id: idx + 1, nombre: e.nombre }));
        } catch {
          entsFinal = ENTRENADORES_PREDETERMINADOS.map((nombre, idx) => ({ id: idx + 1, nombre }));
        }
      }
      setEntrenadores(entsFinal || []);

      let horsFinal = hors;
      if (!horsFinal || horsFinal.length === 0) {
        try {
          const toInsert = HORARIOS_PREDETERMINADOS.map(descripcion => ({ descripcion }));
          const { data: seeded } = await supabase.from('horarios').insert(toInsert).select();
          horsFinal = seeded && seeded.length > 0 ? seeded : toInsert.map((h, idx) => ({ id: idx + 1, descripcion: h.descripcion }));
        } catch {
          horsFinal = HORARIOS_PREDETERMINADOS.map((descripcion, idx) => ({ id: idx + 1, descripcion }));
        }
      }
      setHorarios(horsFinal || []);
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSincronizarCronograma = async () => {
    setSyncingCronograma(true);
    try {
      // 1. Sincronizar Entrenadores
      const existentesEnts = new Set(entrenadores.map(e => e.nombre?.toLowerCase().trim()));
      const faltantesEnts = ENTRENADORES_PREDETERMINADOS.filter(nombre => !existentesEnts.has(nombre.toLowerCase().trim()));
      
      let nuevosEntsData = [...entrenadores];
      if (faltantesEnts.length > 0) {
        const { data: inserted } = await supabase.from('entrenadores').insert(faltantesEnts.map(nombre => ({ nombre }))).select();
        if (inserted && inserted.length > 0) {
          nuevosEntsData = [...nuevosEntsData, ...inserted];
        } else {
          nuevosEntsData = [...nuevosEntsData, ...faltantesEnts.map((n, i) => ({ id: Date.now() + i, nombre: n }))];
        }
      }
      setEntrenadores(nuevosEntsData);

      // 2. Sincronizar Horarios
      const existentesHors = new Set(horarios.map(h => h.descripcion?.toLowerCase().trim()));
      const faltantesHors = HORARIOS_PREDETERMINADOS.filter(desc => !existentesHors.has(desc.toLowerCase().trim()));

      let nuevosHorsData = [...horarios];
      if (faltantesHors.length > 0) {
        const { data: inserted } = await supabase.from('horarios').insert(faltantesHors.map(descripcion => ({ descripcion }))).select();
        if (inserted && inserted.length > 0) {
          nuevosHorsData = [...nuevosHorsData, ...inserted];
        } else {
          nuevosHorsData = [...nuevosHorsData, ...faltantesHors.map((d, i) => ({ id: Date.now() + i, descripcion: d }))];
        }
      }
      setHorarios(nuevosHorsData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error sincronizando cronograma:', err);
      alert('Error al sincronizar cronograma: ' + err.message);
    } finally {
      setSyncingCronograma(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (name === 'facturero_ambiente') {
      setForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (form.ruc?.trim() && !/^\d{13}$/.test(form.ruc.trim()))
      errs.ruc = 'El RUC debe tener exactamente 13 dígitos';
    if (form.cod_establecimiento?.trim() && !/^\d{3}$/.test(form.cod_establecimiento.trim()))
      errs.cod_establecimiento = 'Debe ser exactamente 3 dígitos (ej: 001)';
    if (form.cod_punto_emision?.trim() && !/^\d{3}$/.test(form.cod_punto_emision.trim()))
      errs.cod_punto_emision = 'Debe ser exactamente 3 dígitos (ej: 001)';
    return errs;
  };

  const handleSave = async () => {
    if (activeTab === 'deportivo') {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return;
    }

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const payload = {
      razon_social:               form.razon_social?.trim() || 'Club',
      ruc:                        form.ruc?.trim() || '9999999999999',
      nombre_comercial:           form.nombre_comercial?.trim() || form.razon_social?.trim() || 'Club',
      direccion_matriz:           form.direccion_matriz?.trim() || 'Cuenca, Ecuador',
      contribuyente_especial:     form.contribuyente_especial?.trim() || '',
      obligado_contabilidad:      form.obligado_contabilidad || 'NO',
      telefono:                   form.telefono?.trim() || '',
      email_club:                 form.email_club?.trim() || '',
      logo_url:                   form.logo_url || null,
      facturero_user:             form.facturero_user?.trim() || null,
      facturero_password:         form.facturero_password?.trim() || null,
      facturero_ambiente:         form.facturero_ambiente || 'pruebas',
      facturero_producto_id:      form.facturero_producto_id?.trim() || null,
      cod_establecimiento:        form.cod_establecimiento?.trim() || '001',
      cod_punto_emision:          form.cod_punto_emision?.trim() || '001',
      tarifa_iva:                 form.tarifa_iva || '0',
      precio_pension:             form.precio_pension || '55.00',
    };

    let error = null;
    if (configId) {
      const res = await supabase.from('config_club').update(payload).eq('id', configId);
      error = res.error;
    } else {
      const { data: existing } = await supabase.from('config_club').select('id').maybeSingle();
      if (existing?.id) {
        setConfigId(existing.id);
        const res = await supabase.from('config_club').update(payload).eq('id', existing.id);
        error = res.error;
      } else {
        const res = await supabase.from('config_club').insert([payload]).select().maybeSingle();
        if (res.data?.id) setConfigId(res.data.id);
        error = res.error;
      }
    }

    setSaving(false);
    if (error) {
      setSaveError(`Error al guardar: ${error.message}`);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const handleTestApi = async () => {
    if (!form.facturero_user || !form.facturero_password) {
      setTestResult({ ok: false, message: 'Ingresa tu usuario y contraseña de Facturero Móvil.' });
      return;
    }
    setTestingApi(true);
    setTestResult(null);
    try {
      const baseUrl = form.facturero_ambiente === 'produccion' 
        ? 'https://app.factureromovil.com/api' 
        : 'http://apptest.factureromovil.com/api';
        
      const res = await fetch(`${baseUrl}/login_check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _username: form.facturero_user,
          _password: form.facturero_password
        })
      });
      if (res.ok) {
        setTestResult({ ok: true, message: `✅ Conexión exitosa con Facturero Móvil (${form.facturero_ambiente}).` });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({ ok: false, message: `❌ Error ${res.status}: Credenciales inválidas.` });
      }
    } catch (err) {
      setTestResult({ ok: false, message: `❌ No se pudo conectar: ${err.message}` });
    }
    setTestingApi(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('El logo no debe superar 2 MB.'); return; }
    setLogoUploading(true);
    const ext = file.name.split('.').pop();
    const path = `club-config/logo.${ext}`;
    const { error: upErr } = await supabase.storage.from('fichas').upload(path, file, { upsert: true });
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('fichas').getPublicUrl(path);
      setForm(prev => ({ ...prev, logo_url: urlData.publicUrl }));
    } else {
      alert(`Error al subir logo: ${upErr.message}`);
    }
    setLogoUploading(false);
  };

  const configCompletaParaFacturar = form.ruc.length === 13
    && form.razon_social.trim()
    && form.direccion_matriz.trim()
    && form.facturero_user.trim()
    && form.facturero_password.trim();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-400">
        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  const tabs = [
    { id: 'club',        label: 'Club',         icon: 'business' },
    { id: 'facturacion', label: 'Facturación',   icon: 'receipt_long' },
    { id: 'deportivo',   label: 'Cuerpo Técnico', icon: 'sports_volleyball' },
  ];

  return (
    <div className="space-y-0 max-w-4xl">

      {/* ── Notificaciones ── */}
      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-green-500 text-white text-sm font-semibold">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Configuración guardada exitosamente.
        </div>
      )}
      {saveError && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {saveError}
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 flex-1 justify-center sm:justify-start sm:flex-none ${
                activeTab === t.id
                  ? 'border-[#001f3f] text-[#001f3f] bg-[#001f3f]/5'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: CLUB ── */}
        {activeTab === 'club' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Datos del Club</h3>
              <p className="text-xs text-gray-500">Información general del club que aparecerá en documentos y facturas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <ConfigField label="RUC del Club *" error={fieldErrors.ruc}
                  hint="13 dígitos. Aparece en todas las facturas como emisor.">
                  <input name="ruc" type="text" value={form.ruc} onChange={handleChange}
                    placeholder="0190068729001" maxLength={13}
                    className={fieldErrors.ruc ? inputErrCls : inputCls} />
                </ConfigField>
              </div>

              <div className="md:col-span-2">
                <ConfigField label="Razón Social *" error={fieldErrors.razon_social}>
                  <input name="razon_social" type="text" value={form.razon_social} onChange={handleChange}
                    placeholder="CLUB DEPORTIVO PITO PEREZ"
                    className={fieldErrors.razon_social ? inputErrCls : inputCls} />
                </ConfigField>
              </div>

              <ConfigField label="Nombre Comercial" hint="Si está vacío, se usa la razón social.">
                <input name="nombre_comercial" type="text" value={form.nombre_comercial}
                  onChange={handleChange} placeholder="Club Pito Pérez"
                  className={inputCls} />
              </ConfigField>

              <ConfigField label="Obligado a Llevar Contabilidad">
                <select name="obligado_contabilidad" value={form.obligado_contabilidad}
                  onChange={handleChange} className={inputCls}>
                  <option value="NO">NO</option>
                  <option value="SI">SÍ</option>
                </select>
              </ConfigField>

              <div className="md:col-span-2">
                <ConfigField label="Dirección Matriz *" error={fieldErrors.direccion_matriz}>
                  <input name="direccion_matriz" type="text" value={form.direccion_matriz}
                    onChange={handleChange} placeholder="Av. Solano y 12 de Abril, Cuenca, Azuay"
                    className={fieldErrors.direccion_matriz ? inputErrCls : inputCls} />
                </ConfigField>
              </div>

              <ConfigField label="Contribuyente Especial"
                hint="Número de resolución. Dejar vacío si no aplica.">
                <input name="contribuyente_especial" type="text" value={form.contribuyente_especial}
                  onChange={handleChange} placeholder="(vacío si no aplica)"
                  className={inputCls} />
              </ConfigField>

              <ConfigField label="Teléfono de Contacto">
                <input name="telefono" type="tel" value={form.telefono}
                  onChange={handleChange} placeholder="0987654321"
                  className={inputCls} />
              </ConfigField>

              <div className="md:col-span-2">
                <ConfigField label="Correo Electrónico del Club"
                  hint="Aparece en la información adicional de cada factura.">
                  <input name="email_club" type="email" value={form.email_club}
                    onChange={handleChange} placeholder="contacto@clubpitopirez.com"
                    className={inputCls} />
                </ConfigField>
              </div>
            </div>

            {/* Logo */}
            <div className="border-t border-gray-100 pt-5">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-gray-500">image</span>
                Logo del Club
              </h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                  {form.logo_url
                    ? <img src={form.logo_url} alt="Logo del club" className="w-full h-full object-contain" />
                    : <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                  }
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    Formato PNG o JPG, máximo 2 MB.
                  </p>
                  <button type="button" onClick={() => logoRef.current?.click()}
                    disabled={logoUploading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">
                    {logoUploading
                      ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Subiendo...</>
                      : <><span className="material-symbols-outlined text-[16px]">upload</span> {form.logo_url ? 'Cambiar logo' : 'Subir logo'}</>
                    }
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: FACTURACIÓN ── */}
        {activeTab === 'facturacion' && (
          <div className="p-6 space-y-6">
            {/* Banner estado */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              configCompletaParaFacturar
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <span className="material-symbols-outlined text-[22px]">
                {configCompletaParaFacturar ? 'check_circle' : 'warning'}
              </span>
              <div>
                <p className="font-bold text-sm">
                  {configCompletaParaFacturar
                    ? 'Sistema de facturación configurado y listo'
                    : 'Configuración incompleta — no se podrán emitir facturas'}
                </p>
                <p className="text-xs opacity-75 mt-0.5">
                  {configCompletaParaFacturar
                    ? `Ambiente: ${form.facturero_ambiente === 'produccion' ? '🔵 Producción' : '🟡 Pruebas'}`
                    : 'Completa los datos del Club y credenciales de Facturero Móvil para activar la facturación.'}
                </p>
              </div>
            </div>

            {/* Establecimiento SRI */}
            <div>
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-gray-500">store</span>
                Establecimiento y Punto de Emisión SRI
              </h3>
              <p className="text-xs text-gray-500 mb-4">Códigos que identifican tu punto de facturación ante el SRI.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ConfigField label="Código Establecimiento *" error={fieldErrors.cod_establecimiento}
                  hint="3 dígitos. Ej: 001">
                  <input name="cod_establecimiento" type="text" value={form.cod_establecimiento}
                    onChange={handleChange} placeholder="001" maxLength={3}
                    className={fieldErrors.cod_establecimiento ? inputErrCls : inputCls} />
                </ConfigField>
                <ConfigField label="Punto de Emisión *" error={fieldErrors.cod_punto_emision}
                  hint="3 dígitos. Ej: 001">
                  <input name="cod_punto_emision" type="text" value={form.cod_punto_emision}
                    onChange={handleChange} placeholder="001" maxLength={3}
                    className={fieldErrors.cod_punto_emision ? inputErrCls : inputCls} />
                </ConfigField>
                <ConfigField label="Tarifa de IVA"
                  hint="Servicios deportivos aplican IVA 0% en Ecuador (Art. 55 LRTI).">
                  <select name="tarifa_iva" value={form.tarifa_iva} onChange={handleChange} className={inputCls}>
                    <option value="0">0% — Tarifa diferenciada (servicios deportivos)</option>
                    <option value="15">15% — Tarifa general</option>
                  </select>
                </ConfigField>
              </div>

              <div className="mt-4">
                <ConfigField label="Precio Base de Pensión ($)" hint="Este es el valor predeterminado que se cobrará mensualmente a los deportistas sin descuento." error={fieldErrors.precio_pension}>
                  <input type="number" step="0.01" name="precio_pension" value={form.precio_pension} onChange={handleChange}
                         className={fieldErrors.precio_pension ? inputErrCls : inputCls} placeholder="Ej: 55.00" />
                </ConfigField>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                <p>El número de serie de cada factura será: <strong>{form.cod_establecimiento}-{form.cod_punto_emision}-XXXXXXXXX</strong>. El secuencial lo asigna AutorizadorEC automáticamente.</p>
              </div>
            </div>

            {/* AutorizadorEC */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-gray-500">api</span>
                Integración Facturero Móvil
                {form.facturero_user && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    form.facturero_ambiente === 'produccion'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {form.autorizadorec_ambiente === 'produccion' ? 'Producción' : 'Pruebas'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 mb-4">Conecta con Facturero Móvil para emitir facturas electrónicas SRI.</p>

              {form.facturero_ambiente === 'produccion' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-300 text-blue-800 text-xs mb-4">
                  <span className="material-symbols-outlined text-[16px] shrink-0">verified</span>
                  <p><strong>Modo Producción activo.</strong> Las facturas emitidas serán documentos oficiales válidos ante el SRI.</p>
                </div>
              )}

              {!form.facturero_user && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs mb-4">
                  <span className="material-symbols-outlined text-[20px] text-gray-400 shrink-0">help</span>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">¿No tienes credenciales de Facturero Móvil?</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                      <li>Contacta a <strong>Facturero Móvil</strong> para crear tu cuenta</li>
                      <li>Pídeles tu <strong>Usuario API</strong> y <strong>Clave API</strong> (diferentes a las del portal web)</li>
                      <li>Ingrésalas aquí abajo</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <ConfigField label="Ambiente">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'pruebas', label: 'Pruebas', icon: 'science', desc: 'Facturas de prueba sin validez.' },
                      { val: 'produccion', label: 'Producción', icon: 'verified', desc: 'Facturas reales SRI.' },
                    ].map(opt => (
                      <label key={opt.val}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          form.facturero_ambiente === opt.val
                            ? opt.val === 'produccion' ? 'border-blue-500 bg-blue-50' : 'border-amber-400 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input type="radio" name="facturero_ambiente" value={opt.val}
                          checked={form.facturero_ambiente === opt.val}
                          onChange={handleChange} className="mt-0.5" />
                        <div>
                          <p className="font-bold text-sm text-gray-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </ConfigField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ConfigField label="Usuario API Facturero Móvil"
                    hint="Usuario proporcionado por Facturero Móvil para la API.">
                    <input name="facturero_user"
                      type="text"
                      value={form.facturero_user} onChange={handleChange}
                      placeholder="APITEST"
                      className={inputCls} />
                  </ConfigField>

                  <ConfigField label="Clave API Facturero Móvil"
                    hint="Contraseña de la API">
                    <div className="relative">
                      <input name="facturero_password"
                        type={showApiKey ? 'text' : 'password'}
                        value={form.facturero_password} onChange={handleChange}
                        placeholder="123456"
                        className={`${inputCls} pr-10`} />
                      <button type="button" onClick={() => setShowApiKey(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined text-[18px]">
                          {showApiKey ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </ConfigField>
                </div>

                <ConfigField label="ID del Producto (Servicio) en Facturero Móvil"
                  hint="Es el ID numérico del producto creado en Facturero Móvil para cobrar las pensiones (Ej: 1868).">
                  <input name="facturero_producto_id"
                    type="text"
                    value={form.facturero_producto_id} onChange={handleChange}
                    placeholder="1868"
                    className={inputCls} />
                </ConfigField>

                <div className="pt-1">
                  <button type="button" onClick={handleTestApi} disabled={testingApi}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#001f3f] text-[#001f3f] text-sm font-semibold hover:bg-[#001f3f]/5 transition-colors disabled:opacity-50">
                    {testingApi
                      ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Probando conexión...</>
                      : <><span className="material-symbols-outlined text-[16px]">network_check</span> Probar conexión con Facturero Móvil</>
                    }
                  </button>
                  {testResult && (
                    <p className={`mt-2 text-xs font-semibold ${testResult.ok ? 'text-green-700' : 'text-red-700'}`}>
                      {testResult.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: DEPORTIVO ── */}
        {activeTab === 'deportivo' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-50/70 to-blue-50/70 p-4 rounded-xl border border-orange-200/60">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-orange-500 text-[20px]">sports_volleyball</span>
                  Catálogo Oficial del Cronograma Deportivo
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Gestiona los profesores y grupos de entrenamiento que se asignan a las deportistas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSincronizarCronograma}
                disabled={syncingCronograma}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 text-xs font-bold transition-all shadow-sm shrink-0 disabled:opacity-60"
              >
                {syncingCronograma ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] text-orange-500">sync</span>
                )}
                Sincronizar Cronograma Oficial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Entrenadores */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-orange-500">person</span>
                  Entrenadores / Cuerpo Técnico
                </h4>
                <p className="text-xs text-gray-500 mb-3">Opciones que aparecerán al asignar un entrenador.</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Ej: Marcos Pérez (FIV 3)"
                    className={inputCls}
                    value={nuevoEntrenador}
                    onChange={e => setNuevoEntrenador(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!nuevoEntrenador.trim()) return;
                        const val = nuevoEntrenador.trim();
                        setNuevoEntrenador('');
                        const { data, error } = await supabase.from('entrenadores').insert({ nombre: val }).select().single();
                        if (!error && data) setEntrenadores(prev => [...prev, data]);
                      }
                    }}
                  />
                  <button type="button" onClick={async () => {
                    if (!nuevoEntrenador.trim()) return;
                    const val = nuevoEntrenador.trim();
                    setNuevoEntrenador('');
                    const { data, error } = await supabase.from('entrenadores').insert({ nombre: val }).select().single();
                    if (!error && data) setEntrenadores(prev => [...prev, data]);
                  }} className="px-3 py-2 bg-[#001f3f] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto bg-gray-50/50">
                  {entrenadores.length === 0 ? (
                    <div className="p-6 text-center">
                      <span className="material-symbols-outlined text-gray-300 text-3xl block mb-1">person_off</span>
                      <p className="text-xs text-gray-400">No hay entrenadores registrados</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {entrenadores.map((ent) => (
                        <li key={ent.id} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#001f3f]/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px] text-[#001f3f]">person</span>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{ent.nombre}</span>
                          </div>
                          <button type="button" onClick={async () => {
                            await supabase.from('entrenadores').delete().eq('id', ent.id);
                            setEntrenadores(prev => prev.filter(e => e.id !== ent.id));
                          }}
                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Horarios */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-orange-500">schedule</span>
                  Grupos y Horarios
                </h4>
                <p className="text-xs text-gray-500 mb-3">Opciones que aparecerán al asignar un horario.</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Ej: Lunes, Miércoles - 16:00 a 18:00"
                    className={inputCls}
                    value={nuevoHorario}
                    onChange={e => setNuevoHorario(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!nuevoHorario.trim()) return;
                        const val = nuevoHorario.trim();
                        setNuevoHorario('');
                        const { data, error } = await supabase.from('horarios').insert({ descripcion: val }).select().single();
                        if (!error && data) setHorarios(prev => [...prev, data]);
                      }
                    }}
                  />
                  <button type="button" onClick={async () => {
                    if (!nuevoHorario.trim()) return;
                    const val = nuevoHorario.trim();
                    setNuevoHorario('');
                    const { data, error } = await supabase.from('horarios').insert({ descripcion: val }).select().single();
                    if (!error && data) setHorarios(prev => [...prev, data]);
                  }} className="px-3 py-2 bg-[#001f3f] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto bg-gray-50/50">
                  {horarios.length === 0 ? (
                    <div className="p-6 text-center">
                      <span className="material-symbols-outlined text-gray-300 text-3xl block mb-1">event_busy</span>
                      <p className="text-xs text-gray-400">No hay horarios registrados</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {horarios.map((hor) => (
                        <li key={hor.id} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px] text-orange-500">schedule</span>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{hor.descripcion}</span>
                          </div>
                          <button type="button" onClick={async () => {
                            await supabase.from('horarios').delete().eq('id', hor.id);
                            setHorarios(prev => prev.filter(h => h.id !== hor.id));
                          }}
                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Barra de guardado inferior ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500 hidden sm:block">
            {activeTab === 'facturacion'
              ? 'Los cambios aplican a las próximas facturas emitidas.'
              : activeTab === 'deportivo'
              ? '✅ Los cambios en entrenadores y horarios se guardan automáticamente al agregarlos o eliminarlos.'
              : 'Los cambios se guardan en la base de datos del club.'}
          </p>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#001f3f] text-white text-sm font-bold hover:bg-blue-900 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed ml-auto">
            {saving
              ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Guardando...</>
              : <><span className="material-symbols-outlined text-[18px]">save</span> Guardar Cambios</>
            }
          </button>
        </div>
      </div>

    </div>
  );
}
