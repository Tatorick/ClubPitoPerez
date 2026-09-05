import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

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
    autorizadorec_api_key: '',
    autorizadorec_ambiente: 'pruebas',
    autorizadorec_webhook_secret: '',
    autorizadorec_base_url: 'https://sandbox.autorizadorec.com',
    cod_establecimiento: '001',
    cod_punto_emision: '001',
    tarifa_iva: '0',
    entrenadores_lista: [],
    horarios_lista: [],
  });

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
          autorizadorec_api_key:      data.autorizadorec_api_key || '',
          autorizadorec_ambiente:     data.autorizadorec_ambiente || 'pruebas',
          autorizadorec_webhook_secret: data.autorizadorec_webhook_secret || '',
          autorizadorec_base_url:     data.autorizadorec_base_url || 'https://sandbox.autorizadorec.com',
          cod_establecimiento:        data.cod_establecimiento || '001',
          cod_punto_emision:          data.cod_punto_emision || '001',
          tarifa_iva:                 data.tarifa_iva || '0',
          entrenadores_lista:         data.entrenadores_lista || [],
          horarios_lista:             data.horarios_lista || [],
        }));
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (name === 'autorizadorec_ambiente') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        autorizadorec_base_url: value === 'produccion'
          ? 'https://api.autorizadorec.com'
          : 'https://sandbox.autorizadorec.com',
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.razon_social.trim()) errs.razon_social = 'La razón social es obligatoria';
    if (!form.ruc.trim() || !/^\d{13}$/.test(form.ruc.trim()))
      errs.ruc = 'El RUC debe tener exactamente 13 dígitos';
    if (!form.direccion_matriz.trim()) errs.direccion_matriz = 'La dirección es obligatoria';
    if (!/^\d{3}$/.test(form.cod_establecimiento))
      errs.cod_establecimiento = 'Debe ser exactamente 3 dígitos (ej: 001)';
    if (!/^\d{3}$/.test(form.cod_punto_emision))
      errs.cod_punto_emision = 'Debe ser exactamente 3 dígitos (ej: 001)';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    const { error } = await supabase.from('config_club').update({
      razon_social:               form.razon_social.trim(),
      ruc:                        form.ruc.trim(),
      nombre_comercial:           form.nombre_comercial.trim() || form.razon_social.trim(),
      direccion_matriz:           form.direccion_matriz.trim(),
      contribuyente_especial:     form.contribuyente_especial.trim(),
      obligado_contabilidad:      form.obligado_contabilidad,
      telefono:                   form.telefono.trim(),
      email_club:                 form.email_club.trim(),
      logo_url:                   form.logo_url || null,
      autorizadorec_api_key:      form.autorizadorec_api_key.trim() || null,
      autorizadorec_ambiente:     form.autorizadorec_ambiente,
      autorizadorec_webhook_secret: form.autorizadorec_webhook_secret.trim() || null,
      autorizadorec_base_url:     form.autorizadorec_base_url,
      cod_establecimiento:        form.cod_establecimiento.trim(),
      cod_punto_emision:          form.cod_punto_emision.trim(),
      tarifa_iva:                 form.tarifa_iva,
      entrenadores_lista:         form.entrenadores_lista,
      horarios_lista:             form.horarios_lista,
    }).eq('singleton', true);
    setSaving(false);
    if (error) {
      setSaveError(`Error al guardar: ${error.message}`);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const handleTestApi = async () => {
    if (!form.autorizadorec_api_key) {
      setTestResult({ ok: false, message: 'Ingresa primero tu API Key de AutorizadorEC.' });
      return;
    }
    setTestingApi(true);
    setTestResult(null);
    try {
      const baseUrl = form.autorizadorec_base_url || 'https://sandbox.autorizadorec.com';
      const res = await fetch(`${baseUrl}/api/v1/health`, {
        headers: { Authorization: `Bearer ${form.autorizadorec_api_key}` },
      });
      if (res.ok) {
        setTestResult({ ok: true, message: `✅ Conexión exitosa con AutorizadorEC (${form.autorizadorec_ambiente}).` });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({ ok: false, message: `❌ Error ${res.status}: ${data?.message || 'API Key inválida o sin acceso.'}` });
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
    && form.autorizadorec_api_key.trim();

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
                    ? `Ambiente: ${form.autorizadorec_ambiente === 'produccion' ? '🔵 Producción' : '🟡 Pruebas (Sandbox)'}`
                    : 'Completa los datos del Club y el API Key de AutorizadorEC para activar la facturación.'}
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
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                <p>El número de serie de cada factura será: <strong>{form.cod_establecimiento}-{form.cod_punto_emision}-XXXXXXXXX</strong>. El secuencial lo asigna AutorizadorEC automáticamente.</p>
              </div>
            </div>

            {/* AutorizadorEC */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-gray-500">api</span>
                Integración AutorizadorEC
                {form.autorizadorec_api_key && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    form.autorizadorec_ambiente === 'produccion'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {form.autorizadorec_ambiente === 'produccion' ? 'Producción' : 'Pruebas'}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 mb-4">Conecta con AutorizadorEC para emitir facturas electrónicas SRI.</p>

              {form.autorizadorec_ambiente === 'produccion' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-300 text-blue-800 text-xs mb-4">
                  <span className="material-symbols-outlined text-[16px] shrink-0">verified</span>
                  <p><strong>Modo Producción activo.</strong> Las facturas emitidas serán documentos oficiales válidos ante el SRI.</p>
                </div>
              )}

              {!form.autorizadorec_api_key && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs mb-4">
                  <span className="material-symbols-outlined text-[20px] text-gray-400 shrink-0">help</span>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">¿Aún no tienes cuenta en AutorizadorEC?</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                      <li>Regístrate en <strong>autorizadorec.com</strong> (Plan Básico $5/mes)</li>
                      <li>Sube tu certificado <strong>.p12</strong> en su plataforma</li>
                      <li>Copia tu <strong>API Key</strong> desde su dashboard</li>
                      <li>Pégala aquí y guarda</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <ConfigField label="Ambiente">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'pruebas', label: 'Pruebas (Sandbox)', icon: 'science', desc: 'Documentos de prueba gratuitos. Usar para desarrollo.' },
                      { val: 'produccion', label: 'Producción', icon: 'verified', desc: 'Facturas reales autorizadas por el SRI.' },
                    ].map(opt => (
                      <label key={opt.val}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          form.autorizadorec_ambiente === opt.val
                            ? opt.val === 'produccion' ? 'border-blue-500 bg-blue-50' : 'border-amber-400 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input type="radio" name="autorizadorec_ambiente" value={opt.val}
                          checked={form.autorizadorec_ambiente === opt.val}
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

                <ConfigField label="API Key de AutorizadorEC"
                  hint="Empieza con sk_live_ (producción) o sk_test_ (pruebas). Se guarda de forma segura.">
                  <div className="relative">
                    <input name="autorizadorec_api_key"
                      type={showApiKey ? 'text' : 'password'}
                      value={form.autorizadorec_api_key} onChange={handleChange}
                      placeholder="sk_test_xxxxxxxxxxxxxxxxxxxx"
                      className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowApiKey(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-[18px]">
                        {showApiKey ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </ConfigField>

                <ConfigField label="Webhook Secret"
                  hint="Lo encuentras en AutorizadorEC → Webhooks → Secreto de firma HMAC.">
                  <div className="relative">
                    <input name="autorizadorec_webhook_secret"
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={form.autorizadorec_webhook_secret} onChange={handleChange}
                      placeholder="whsec_xxxxxxxxxxxxxxxxxxxx"
                      className={`${inputCls} pr-10`} />
                    <button type="button" onClick={() => setShowWebhookSecret(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-[18px]">
                        {showWebhookSecret ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </ConfigField>

                <ConfigField label="URL de Webhook (copia esto en AutorizadorEC)"
                  hint="Ve a AutorizadorEC → Webhooks → Agregar endpoint → Pega esta URL.">
                  <div className="flex gap-2">
                    <input readOnly
                      value={`${window.location.origin}/api/webhook-autorizadorec`}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50 cursor-default" />
                    <button type="button"
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhook-autorizadorec`)}
                      className="px-3 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      Copiar
                    </button>
                  </div>
                </ConfigField>

                <div className="pt-1">
                  <button type="button" onClick={handleTestApi} disabled={testingApi}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#001f3f] text-[#001f3f] text-sm font-semibold hover:bg-[#001f3f]/5 transition-colors disabled:opacity-50">
                    {testingApi
                      ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Probando conexión...</>
                      : <><span className="material-symbols-outlined text-[16px]">network_check</span> Probar conexión con AutorizadorEC</>
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
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Catálogo de Entrenadores y Horarios</h3>
              <p className="text-xs text-gray-500">
                Administra las opciones disponibles al asignar un entrenador o grupo a un deportista.
                Al guardar, estos cambios se reflejan automáticamente en todos los perfiles.
              </p>
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!nuevoEntrenador.trim()) return;
                        setForm(prev => ({ ...prev, entrenadores_lista: [...(prev.entrenadores_lista||[]), nuevoEntrenador.trim()] }));
                        setNuevoEntrenador('');
                      }
                    }}
                  />
                  <button type="button" onClick={() => {
                    if (!nuevoEntrenador.trim()) return;
                    setForm(prev => ({ ...prev, entrenadores_lista: [...(prev.entrenadores_lista||[]), nuevoEntrenador.trim()] }));
                    setNuevoEntrenador('');
                  }} className="px-3 py-2 bg-[#001f3f] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto bg-gray-50/50">
                  {(!form.entrenadores_lista || form.entrenadores_lista.length === 0) ? (
                    <div className="p-6 text-center">
                      <span className="material-symbols-outlined text-gray-300 text-3xl block mb-1">person_off</span>
                      <p className="text-xs text-gray-400">No hay entrenadores registrados</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {form.entrenadores_lista.map((ent, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#001f3f]/10 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px] text-[#001f3f]">person</span>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{ent}</span>
                          </div>
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, entrenadores_lista: prev.entrenadores_lista.filter((_, i) => i !== idx) }))}
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!nuevoHorario.trim()) return;
                        setForm(prev => ({ ...prev, horarios_lista: [...(prev.horarios_lista||[]), nuevoHorario.trim()] }));
                        setNuevoHorario('');
                      }
                    }}
                  />
                  <button type="button" onClick={() => {
                    if (!nuevoHorario.trim()) return;
                    setForm(prev => ({ ...prev, horarios_lista: [...(prev.horarios_lista||[]), nuevoHorario.trim()] }));
                    setNuevoHorario('');
                  }} className="px-3 py-2 bg-[#001f3f] text-white rounded-lg hover:bg-blue-900 font-bold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <div className="border border-gray-200 rounded-xl max-h-56 overflow-y-auto bg-gray-50/50">
                  {(!form.horarios_lista || form.horarios_lista.length === 0) ? (
                    <div className="p-6 text-center">
                      <span className="material-symbols-outlined text-gray-300 text-3xl block mb-1">event_busy</span>
                      <p className="text-xs text-gray-400">No hay horarios registrados</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {form.horarios_lista.map((hor, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3 hover:bg-white transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px] text-orange-500">schedule</span>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{hor}</span>
                          </div>
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, horarios_lista: prev.horarios_lista.filter((_, i) => i !== idx) }))}
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
          <p className="text-xs text-gray-400 hidden sm:block">
            {activeTab === 'facturacion'
              ? 'Los cambios aplican a las próximas facturas emitidas.'
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
