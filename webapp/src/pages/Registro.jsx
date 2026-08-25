import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ── Clases reutilizables ───────────────────────────────────────────────────────
const inputBase = "w-full border rounded-lg px-3 py-2.5 text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm";
const inputOk   = `${inputBase} border-gray-300 focus:border-blue-600 focus:ring-blue-200`;
const inputErr  = `${inputBase} border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200`;
const selectOk  = inputOk;
const selectErr = inputErr;
const labelCls  = "block text-sm font-semibold text-gray-700 mb-1";

// ── Validaciones Ecuador ───────────────────────────────────────────────────────

/** Valida cédula ecuatoriana de 10 dígitos con dígito verificador (Módulo 10) */
function validarCedulaEC(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;
  const prov = parseInt(cedula.substring(0, 2), 10);
  if (prov < 1 || prov > 24) return false;
  const coefs = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let val = parseInt(cedula[i], 10) * coefs[i];
    if (val >= 10) val -= 9;
    suma += val;
  }
  const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  return verificador === parseInt(cedula[9], 10);
}

/** Valida RUC (13 dígitos) o cédula (10 dígitos) */
function validarRucOCedula(valor) {
  const v = valor.trim();
  if (v.length === 10) return validarCedulaEC(v);
  if (v.length === 13) {
    if (!validarCedulaEC(v.substring(0, 10))) return false;
    return v.endsWith('001');
  }
  return false;
}

/** Valida teléfono celular ecuatoriano: empieza con 09, 10 dígitos */
function validarCelularEC(tel) {
  return /^09\d{8}$/.test(tel.trim());
}

/** Valida email con regex estricto */
function validarEmail(email) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

// ── PhotoUploader ──────────────────────────────────────────────────────────────
function PhotoUploader({ value, onChange }) {
  const fileRef   = useRef(null);
  const cameraRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen supera el límite de 5 MB. Usa una imagen más pequeña.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result, file);
    reader.readAsDataURL(file);
  };

  return (
    <div className="md:col-span-2">
      <label className={labelCls}>Fotografía del Jugador <span className="text-red-500">*</span></label>
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-1">
        <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
          {value ? (
            <img src={value} alt="Foto del jugador" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <span className="material-symbols-outlined text-4xl">person</span>
              <span className="text-[10px] text-center leading-tight mt-1">Sin foto</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button type="button" onClick={() => fileRef.current.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">upload</span>
            Subir desde galería / computadora
          </button>
          <button type="button" onClick={() => cameraRef.current.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-600 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors">
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            Tomar foto con la cámara
          </button>
          <p className="text-xs text-gray-500">JPG o PNG, máximo 5MB. Fondo claro recomendado.</p>
        </div>
        <input ref={fileRef}   type="file" accept="image/*"               className="hidden" onChange={handleFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ── Componente de campo con error ─────────────────────────────────────────────
function Field({ label, error, required, children, wide }) {
  return (
    <div className={`flex flex-col${wide ? ' md:col-span-2' : ''}`}>
      <label className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Registro ──────────────────────────────────────────────────────────────────
export default function Registro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fotoJugador, setFotoJugador]     = useState(null);
  const [fotoFile, setFotoFile]           = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError]     = useState('');
  const [fieldErrors, setFieldErrors]     = useState({});

  const [formData, setFormData] = useState({
    // Paso 1
    email: '', password: '', confirmPassword: '',
    nombresJugador: '', cedulaJugador: '', fechaNacimientoJugador: '',
    genero: '', nacionalidad: 'ECUATORIANA', direccion: '',
    // Paso 2
    discapacidad: 'NO', tipoDiscapacidad: '', porcentajeDiscapacidad: '',
    nee: 'NO', usaLentes: 'NO',
    // Paso 3
    nombresPadre: '', cedulaPadre: '', telefonoPadre: '', ocupacionPadre: '',
    nombresMadre: '', cedulaMadre: '', telefonoMadre: '', ocupacionMadre: '',
    esRepresentante: 'Madre',
    // Paso 4
    rucFacturacion: '', nombreFacturacion: '', direccionFacturacion: '',
    telefonoFacturacion: '', correoFacturacion: '',
    // Paso 5
    autorizaImagen: '', firmaRepresentante: '', leyoAutorizacion: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const steps = ['Jugador y Cuenta', 'Ficha Médica', 'Datos Familiares', 'Facturación', 'Autorización de Imagen'];

  // ── Validación por paso ─────────────────────────────────────────────────────
  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!validarEmail(formData.email))
        errs.email = 'Ingresa un correo electrónico válido (ej: nombre@dominio.com)';
      if (formData.password.length < 8 || !/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password))
        errs.password = 'La contraseña debe tener al menos 8 caracteres, incluir letras y números';
      if (formData.password !== formData.confirmPassword)
        errs.confirmPassword = 'Las contraseñas no coinciden';
      if (!formData.nombresJugador.trim() || formData.nombresJugador.trim().length < 5)
        errs.nombresJugador = 'Ingresa el nombre completo (apellidos y nombres, mínimo 5 caracteres)';
      if (!validarCedulaEC(formData.cedulaJugador))
        errs.cedulaJugador = 'La cédula no es válida. Debe ser ecuatoriana de 10 dígitos con dígito verificador correcto';
      if (!formData.fechaNacimientoJugador)
        errs.fechaNacimientoJugador = 'La fecha de nacimiento es obligatoria';
      if (!formData.genero)
        errs.genero = 'Selecciona el género';
      if (!formData.direccion.trim() || formData.direccion.trim().length < 10)
        errs.direccion = 'Ingresa la dirección completa (barrio, calle, número — mínimo 10 caracteres)';
    }
    if (s === 2) {
      if (formData.discapacidad === 'SI') {
        if (!formData.tipoDiscapacidad.trim()) errs.tipoDiscapacidad = 'Especifica el tipo de discapacidad';
        const pct = parseInt(formData.porcentajeDiscapacidad, 10);
        if (!formData.porcentajeDiscapacidad || pct < 1 || pct > 100)
          errs.porcentajeDiscapacidad = 'El porcentaje debe ser entre 1 y 100';
      }
    }
    if (s === 3) {
      const tienePadre = formData.nombresPadre.trim().length > 0;
      const tieneMadre = formData.nombresMadre.trim().length > 0;
      if (!tienePadre && !tieneMadre)
        errs._familiares = 'Debes ingresar los datos de al menos uno de los padres o representantes';
      if (tienePadre) {
        if (formData.nombresPadre.trim().length < 5) errs.nombresPadre = 'Ingresa el nombre completo del padre';
        if (!formData.cedulaPadre) errs.cedulaPadre = 'La cédula del padre es obligatoria';
        else if (!validarCedulaEC(formData.cedulaPadre)) errs.cedulaPadre = 'Cédula del padre inválida (10 dígitos, dígito verificador correcto)';
        if (!formData.telefonoPadre) errs.telefonoPadre = 'El teléfono del padre es obligatorio';
        else if (!validarCelularEC(formData.telefonoPadre)) errs.telefonoPadre = 'El celular debe ser ecuatoriano: 09XXXXXXXX (10 dígitos)';
      }
      if (tieneMadre) {
        if (formData.nombresMadre.trim().length < 5) errs.nombresMadre = 'Ingresa el nombre completo de la madre';
        if (!formData.cedulaMadre) errs.cedulaMadre = 'La cédula de la madre es obligatoria';
        else if (!validarCedulaEC(formData.cedulaMadre)) errs.cedulaMadre = 'Cédula de la madre inválida (10 dígitos, dígito verificador correcto)';
        if (!formData.telefonoMadre) errs.telefonoMadre = 'El teléfono de la madre es obligatorio';
        else if (!validarCelularEC(formData.telefonoMadre)) errs.telefonoMadre = 'El celular debe ser ecuatoriano: 09XXXXXXXX (10 dígitos)';
      }
    }
    if (s === 4) {
      if (!validarRucOCedula(formData.rucFacturacion))
        errs.rucFacturacion = 'Ingresa una cédula (10 dígitos) o RUC (13 dígitos) válido';
      if (!validarCelularEC(formData.telefonoFacturacion))
        errs.telefonoFacturacion = 'El teléfono debe ser celular ecuatoriano: 09XXXXXXXX (10 dígitos)';
      if (!formData.nombreFacturacion.trim()) errs.nombreFacturacion = 'La razón social o nombre completo es obligatorio';
      if (!formData.direccionFacturacion.trim()) errs.direccionFacturacion = 'La dirección de facturación es obligatoria';
      if (!validarEmail(formData.correoFacturacion)) errs.correoFacturacion = 'Ingresa un correo electrónico válido para facturación';
    }
    if (s === 5) {
      if (!formData.autorizaImagen) errs.autorizaImagen = 'Debes seleccionar una opción de autorización de imagen';
      if (!formData.firmaRepresentante.trim() || formData.firmaRepresentante.trim().length < 5)
        errs.firmaRepresentante = 'Ingresa el nombre completo del representante legal que autoriza';
      if (!formData.leyoAutorizacion) errs.leyoAutorizacion = 'Debes confirmar que has leído y comprendido la autorización';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(step);
    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const handlePrev = () => { setFieldErrors({}); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ── Submit a Supabase ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(5);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(), password: formData.password,
        options: { data: { nombre: formData.nombresJugador.trim() } },
      });
      if (authError) throw new Error(authError.message);
      const userId = authData.user?.id;
      if (!userId) throw new Error('No se pudo crear la cuenta. Intenta con otro correo.');

      let fotoUrl = null;
      if (fotoFile) {
        const ext = fotoFile.name.split('.').pop();
        const { error: uploadError } = await supabase.storage.from('fichas-fotos').upload(`${userId}/foto.${ext}`, fotoFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('fichas-fotos').getPublicUrl(`${userId}/foto.${ext}`);
          fotoUrl = urlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from('fichas').insert({
        user_id: userId, foto_url: fotoUrl,
        nombres_jugador: formData.nombresJugador.trim(), cedula_jugador: formData.cedulaJugador.trim(),
        fecha_nacimiento: formData.fechaNacimientoJugador, genero: formData.genero,
        nacionalidad: formData.nacionalidad.trim(), direccion: formData.direccion.trim(),
        discapacidad: formData.discapacidad, tipo_discapacidad: formData.tipoDiscapacidad || null,
        porcentaje_discapacidad: formData.porcentajeDiscapacidad ? parseInt(formData.porcentajeDiscapacidad, 10) : null,
        nee: formData.nee, usa_lentes: formData.usaLentes,
        nombres_padre: formData.nombresPadre || null, cedula_padre: formData.cedulaPadre || null,
        telefono_padre: formData.telefonoPadre || null, ocupacion_padre: formData.ocupacionPadre || null,
        nombres_madre: formData.nombresMadre || null, cedula_madre: formData.cedulaMadre || null,
        telefono_madre: formData.telefonoMadre || null, ocupacion_madre: formData.ocupacionMadre || null,
        representante: formData.esRepresentante,
        ruc_facturacion: formData.rucFacturacion.trim(), nombre_facturacion: formData.nombreFacturacion.trim(),
        telefono_facturacion: formData.telefonoFacturacion.trim(), direccion_facturacion: formData.direccionFacturacion.trim(),
        correo_facturacion: formData.correoFacturacion.trim(),
        autoriza_imagen: formData.autorizaImagen === 'SI',
        firma_representante: formData.firmaRepresentante.trim(), fecha_autorizacion: new Date().toISOString(),
      });
      if (insertError) throw new Error(`Error al guardar la ficha: ${insertError.message}`);
      navigate('/perfil', { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'Ocurrió un error inesperado. Intenta de nuevo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setSubmitLoading(false); }
  };

  // ── Input helpers ───────────────────────────────────────────────────────────
  const ic = (name) => fieldErrors[name] ? inputErr : inputOk;
  const sc = (name) => fieldErrors[name] ? selectErr : selectOk;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-body-md flex justify-center items-start md:items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* ── Sidebar ── */}
        <div className="md:w-72 bg-[#001f3f] p-8 text-white flex flex-col justify-between shrink-0">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-8 transition-colors text-sm">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              Volver al Inicio
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">Únete al Club</h2>
            <p className="text-blue-200 text-sm mb-8 leading-relaxed">
              Completa la ficha de matriculación oficial para asegurar tu cupo.
            </p>
            <ul className="space-y-4">
              {steps.map((label, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isDone = step > num;
                return (
                  <li key={num} className={`flex items-center gap-3 text-sm font-semibold transition-colors ${isActive ? 'text-orange-400' : isDone ? 'text-green-400' : 'text-blue-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${isActive ? 'border-orange-400 text-orange-400' : isDone ? 'border-green-400 bg-green-400 text-white' : 'border-blue-400 text-blue-400'}`}>
                      {isDone ? <span className="material-symbols-outlined text-[16px]">check</span> : num}
                    </span>
                    <span className="leading-tight">{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-10 pt-6 border-t border-blue-700">
            <p className="text-blue-300 text-xs mb-1">¿Ya eres miembro?</p>
            <Link to="/login" className="text-orange-400 hover:underline text-sm font-semibold">Iniciar Sesión</Link>
          </div>
        </div>

        {/* ── Form Area ── */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto max-h-[90vh] md:max-h-none">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
            <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
          </div>

          {/* Error global de envío */}
          {submitError && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              <div>
                <p className="font-bold mb-0.5">Error al completar el registro</p>
                <p>{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

            {/* ════ PASO 1: JUGADOR Y CUENTA ════ */}
            {step === 1 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-6">
                  Paso 1: Datos del Jugador y Cuenta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PhotoUploader value={fotoJugador} onChange={(dataUrl, file) => { setFotoJugador(dataUrl); setFotoFile(file); }} />

                  <div className="md:col-span-2 border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Credenciales de acceso al portal</p>
                  </div>

                  <Field label="Correo Electrónico" error={fieldErrors.email} required>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="ejemplo@correo.com" className={ic('email')} autoComplete="email" />
                  </Field>

                  <Field label="Contraseña" error={fieldErrors.password} required>
                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                      placeholder="Mínimo 8 caracteres, letras y números" className={ic('password')} autoComplete="new-password" />
                  </Field>

                  <Field label="Confirmar Contraseña" error={fieldErrors.confirmPassword} required>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Repite la contraseña" className={ic('confirmPassword')} autoComplete="new-password" />
                  </Field>

                  <div className="md:col-span-2 border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Datos del jugador/a</p>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Nombres Completos del Jugador/a" error={fieldErrors.nombresJugador} required>
                      <input type="text" name="nombresJugador" value={formData.nombresJugador} onChange={handleChange}
                        placeholder="Apellidos y Nombres completos" className={ic('nombresJugador')} />
                    </Field>
                  </div>

                  <Field label="Cédula de Identidad" error={fieldErrors.cedulaJugador} required>
                    <input type="text" name="cedulaJugador" value={formData.cedulaJugador} onChange={handleChange}
                      placeholder="0000000000" maxLength={10} className={ic('cedulaJugador')} />
                    <p className="text-xs text-gray-400 mt-1">10 dígitos — se verifica el dígito del Registro Civil</p>
                  </Field>

                  <Field label="Fecha de Nacimiento" error={fieldErrors.fechaNacimientoJugador} required>
                    <input type="date" name="fechaNacimientoJugador" value={formData.fechaNacimientoJugador}
                      onChange={handleChange} max={new Date().toISOString().split('T')[0]} className={ic('fechaNacimientoJugador')} />
                  </Field>

                  <Field label="Género" error={fieldErrors.genero} required>
                    <select name="genero" value={formData.genero} onChange={handleChange} className={sc('genero')}>
                      <option value="">Seleccione...</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                    </select>
                  </Field>

                  <Field label="Nacionalidad" error={fieldErrors.nacionalidad}>
                    <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className={ic('nacionalidad')} />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Dirección Completa" error={fieldErrors.direccion} required>
                      <textarea name="direccion" value={formData.direccion} onChange={handleChange}
                        rows="2" placeholder="Barrio, calle, número, referencia..." className={ic('direccion') + ' resize-none'} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* ════ PASO 2: FICHA MÉDICA ════ */}
            {step === 2 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-2">Paso 2: Ficha Médica</h3>
                <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-blue-500">lock</span>
                  Esta información es confidencial y solo accesible para el administrador del club.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="¿Tiene Discapacidad?" error={fieldErrors.discapacidad}>
                    <select name="discapacidad" value={formData.discapacidad} onChange={handleChange} className={sc('discapacidad')}>
                      <option value="NO">NO</option>
                      <option value="SI">SÍ</option>
                    </select>
                  </Field>
                  {formData.discapacidad === 'SI' && (
                    <>
                      <Field label="Tipo de Discapacidad" error={fieldErrors.tipoDiscapacidad} required>
                        <input type="text" name="tipoDiscapacidad" value={formData.tipoDiscapacidad} onChange={handleChange}
                          placeholder="Ej: Auditiva, Visual, Física..." className={ic('tipoDiscapacidad')} />
                      </Field>
                      <Field label="Porcentaje de Discapacidad (%)" error={fieldErrors.porcentajeDiscapacidad} required>
                        <input type="number" name="porcentajeDiscapacidad" value={formData.porcentajeDiscapacidad}
                          onChange={handleChange} min="1" max="100" className={ic('porcentajeDiscapacidad')} />
                      </Field>
                    </>
                  )}
                  <Field label="¿Necesidades Educativas Especiales (NEE)?" error={fieldErrors.nee}>
                    <select name="nee" value={formData.nee} onChange={handleChange} className={sc('nee')}>
                      <option value="NO">NO</option>
                      <option value="SI">SÍ</option>
                    </select>
                  </Field>
                  <Field label="¿Usa Lentes?" error={fieldErrors.usaLentes}>
                    <select name="usaLentes" value={formData.usaLentes} onChange={handleChange} className={sc('usaLentes')}>
                      <option value="NO">NO</option>
                      <option value="SI">SÍ</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* ════ PASO 3: DATOS FAMILIARES ════ */}
            {step === 3 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-6">Paso 3: Datos Familiares</h3>
                {fieldErrors._familiares && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {fieldErrors._familiares}
                  </div>
                )}
                <div className="space-y-6">
                  {/* Padre */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">man</span> Datos del Padre
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Field label="Nombres Completos" error={fieldErrors.nombresPadre}>
                          <input type="text" name="nombresPadre" value={formData.nombresPadre} onChange={handleChange}
                            placeholder="Apellidos y nombres del padre" className={ic('nombresPadre')} />
                        </Field>
                      </div>
                      <Field label="Cédula de Identidad" error={fieldErrors.cedulaPadre}>
                        <input type="text" name="cedulaPadre" value={formData.cedulaPadre} onChange={handleChange}
                          placeholder="0000000000" maxLength={10} className={ic('cedulaPadre')} />
                      </Field>
                      <Field label="Teléfono Celular" error={fieldErrors.telefonoPadre}>
                        <input type="tel" name="telefonoPadre" value={formData.telefonoPadre} onChange={handleChange}
                          placeholder="09XXXXXXXX" maxLength={10} className={ic('telefonoPadre')} />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Ocupación" error={fieldErrors.ocupacionPadre}>
                          <input type="text" name="ocupacionPadre" value={formData.ocupacionPadre} onChange={handleChange}
                            placeholder="Profesión u ocupación" className={ic('ocupacionPadre')} />
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Madre */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-pink-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">woman</span> Datos de la Madre
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Field label="Nombres Completos" error={fieldErrors.nombresMadre}>
                          <input type="text" name="nombresMadre" value={formData.nombresMadre} onChange={handleChange}
                            placeholder="Apellidos y nombres de la madre" className={ic('nombresMadre')} />
                        </Field>
                      </div>
                      <Field label="Cédula de Identidad" error={fieldErrors.cedulaMadre}>
                        <input type="text" name="cedulaMadre" value={formData.cedulaMadre} onChange={handleChange}
                          placeholder="0000000000" maxLength={10} className={ic('cedulaMadre')} />
                      </Field>
                      <Field label="Teléfono Celular" error={fieldErrors.telefonoMadre}>
                        <input type="tel" name="telefonoMadre" value={formData.telefonoMadre} onChange={handleChange}
                          placeholder="09XXXXXXXX" maxLength={10} className={ic('telefonoMadre')} />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Ocupación" error={fieldErrors.ocupacionMadre}>
                          <input type="text" name="ocupacionMadre" value={formData.ocupacionMadre} onChange={handleChange}
                            placeholder="Profesión u ocupación" className={ic('ocupacionMadre')} />
                        </Field>
                      </div>
                    </div>
                  </div>

                  <Field label="¿Quién es el Representante Legal?" error={fieldErrors.esRepresentante} required>
                    <select name="esRepresentante" value={formData.esRepresentante} onChange={handleChange} className={sc('esRepresentante')}>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Otro">Otro (se coordinará directamente con el club)</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* ════ PASO 4: FACTURACIÓN ════ */}
            {step === 4 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-2">Paso 4: Datos para Facturación</h3>
                <p className="text-sm text-gray-500 mb-6">Estos datos aparecerán en los comprobantes y facturas de pago del club.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Cédula o RUC" error={fieldErrors.rucFacturacion} required>
                    <input type="text" name="rucFacturacion" value={formData.rucFacturacion} onChange={handleChange}
                      placeholder="Cédula (10 dígitos) o RUC (13 dígitos)" maxLength={13} className={ic('rucFacturacion')} />
                    <p className="text-xs text-gray-400 mt-1">Se verifica el dígito del Registro Civil / SRI</p>
                  </Field>
                  <Field label="Teléfono de Contacto" error={fieldErrors.telefonoFacturacion} required>
                    <input type="tel" name="telefonoFacturacion" value={formData.telefonoFacturacion} onChange={handleChange}
                      placeholder="09XXXXXXXX" maxLength={10} className={ic('telefonoFacturacion')} />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Razón Social / Nombre Completo" error={fieldErrors.nombreFacturacion} required>
                      <input type="text" name="nombreFacturacion" value={formData.nombreFacturacion} onChange={handleChange} className={ic('nombreFacturacion')} />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Dirección de Facturación" error={fieldErrors.direccionFacturacion} required>
                      <input type="text" name="direccionFacturacion" value={formData.direccionFacturacion} onChange={handleChange} className={ic('direccionFacturacion')} />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Correo para envío de facturas" error={fieldErrors.correoFacturacion} required>
                      <input type="email" name="correoFacturacion" value={formData.correoFacturacion} onChange={handleChange}
                        placeholder="facturacion@correo.com" className={ic('correoFacturacion')} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* ════ PASO 5: AUTORIZACIÓN DE IMAGEN ════ */}
            {step === 5 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-[22px]">policy</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Paso 5: Autorización de Uso de Imagen</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
                    Ministerio de Educación — Ecuador
                  </span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded uppercase tracking-wider">
                    Documento Oficial
                  </span>
                </div>

                {/* Texto legal */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
                  <p className="font-bold text-blue-900 text-base">AUTORIZACIÓN DE USO DE IMAGEN — CLUB PITO PÉREZ VOLEIBOL</p>
                  <p>
                    De conformidad con lo dispuesto en el <strong>Art. 66, numeral 19 de la Constitución de la República del Ecuador</strong>,
                    el <strong>Art. 9 de la Ley Orgánica de Protección de Datos Personales (LOPDP)</strong> y la
                    <strong> Normativa del Ministerio de Educación del Ecuador para Clubes Deportivos</strong>, el Club Pito Pérez
                    Voleibol Club solicita la autorización del representante legal del menor para el uso de su imagen fotográfica
                    y/o audiovisual con fines deportivos, educativos y de difusión en medios oficiales del club.
                  </p>
                  <p>
                    <strong>Finalidad del uso de imagen:</strong> Las fotografías y/o videos del/la deportista podrán ser publicados en las{' '}
                    <strong>redes sociales oficiales</strong> del club (Facebook, Instagram, TikTok), el <strong>sitio web oficial</strong>,
                    materiales impresos de difusión, boletines internos del club y comunicados a la{' '}
                    <strong>Federación Ecuatoriana de Voleibol</strong>, siempre con fines deportivos, institucionales y sin fines comerciales de terceros.
                  </p>
                  <p>
                    <strong>Derechos del representante:</strong> En cualquier momento puede revocar esta autorización dirigiéndose por escrito
                    al administrador del club. La revocación no afecta los contenidos publicados con anterioridad a la misma.
                  </p>
                  <p className="text-xs text-gray-500">
                    El Club Pito Pérez se compromete a no ceder, vender ni compartir la imagen del menor con terceros sin autorización expresa.
                    El tratamiento se realiza bajo estrictas medidas de seguridad conforme a la LOPDP.
                  </p>
                </div>

                {/* Elección */}
                <div className="mb-5">
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    Decisión del representante legal: <span className="text-red-500">*</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.autorizaImagen === 'SI' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="autorizaImagen" value="SI"
                        checked={formData.autorizaImagen === 'SI'} onChange={handleChange} className="mt-0.5 accent-green-600" />
                      <div>
                        <p className="font-bold text-green-700 text-sm">✓ SÍ AUTORIZO</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          Autorizo al Club Pito Pérez a usar la imagen del/la deportista en sus medios oficiales con fines deportivos e institucionales.
                        </p>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.autorizaImagen === 'NO' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="autorizaImagen" value="NO"
                        checked={formData.autorizaImagen === 'NO'} onChange={handleChange} className="mt-0.5 accent-red-600" />
                      <div>
                        <p className="font-bold text-red-700 text-sm">✗ NO AUTORIZO</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          No autorizo el uso de imagen. El club deberá asegurarse de que el/la deportista no aparezca en publicaciones públicas.
                        </p>
                      </div>
                    </label>
                  </div>
                  {fieldErrors.autorizaImagen && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {fieldErrors.autorizaImagen}
                    </p>
                  )}
                </div>

                <Field label="Nombre completo del Representante Legal que firma" error={fieldErrors.firmaRepresentante} required>
                  <input type="text" name="firmaRepresentante" value={formData.firmaRepresentante} onChange={handleChange}
                    placeholder="Ingresa tu nombre y apellido completo como firma" className={ic('firmaRepresentante')} />
                  <p className="text-xs text-gray-400 mt-1">
                    Fecha de autorización: {new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </Field>

                <div className="mt-4">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.leyoAutorizacion ? 'border-blue-500 bg-blue-50' : fieldErrors.leyoAutorizacion ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                    <input type="checkbox" name="leyoAutorizacion" checked={formData.leyoAutorizacion} onChange={handleChange}
                      className="mt-0.5 accent-blue-600 w-4 h-4 shrink-0" />
                    <span className="text-sm text-gray-700">
                      <strong>Confirmo que he leído y comprendido</strong> el texto de autorización de uso de imagen,
                      que soy el representante legal del/la deportista y que la información proporcionada en esta
                      ficha es verídica y exacta.
                    </span>
                  </label>
                  {fieldErrors.leyoAutorizacion && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {fieldErrors.leyoAutorizacion}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Navegación ── */}
            <div className="flex justify-between pt-4 border-t border-gray-100 mt-2">
              {step > 1 ? (
                <button type="button" onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Atrás
                </button>
              ) : <div />}

              {step < 5 ? (
                <button type="button" onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#001f3f] text-white text-sm font-semibold shadow hover:bg-blue-900 transition-colors">
                  Siguiente <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button type="submit" disabled={submitLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold shadow hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitLoading ? (
                    <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Registrando...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">check_circle</span> Completar Registro</>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
