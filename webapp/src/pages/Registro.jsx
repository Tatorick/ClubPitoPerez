import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

// Clase base reutilizable para todos los inputs del formulario
const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-sm";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
const selectClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-sm";

function PhotoUploader({ value, onChange }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result, file);
    reader.readAsDataURL(file);
  };

  return (
    <div className="md:col-span-2">
      <label className={labelClass}>Fotografía del Jugador</label>
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-1">
        {/* Preview */}
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

        {/* Buttons */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {/* Upload from gallery */}
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">upload</span>
            Subir desde galería / computadora
          </button>

          {/* Take photo with camera (mobile) */}
          <button
            type="button"
            onClick={() => cameraInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-600 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            Tomar foto con la cámara
          </button>

          <p className="text-xs text-gray-500">JPG o PNG, máximo 5MB. Fondo claro recomendado.</p>
        </div>

        {/* Hidden inputs */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

export default function Registro() {
  const [step, setStep] = useState(1);
  const [fotoJugador, setFotoJugador] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombresJugador: '',
    cedulaJugador: '',
    fechaNacimientoJugador: '',
    genero: '',
    nacionalidad: 'ECUATORIANA',
    direccion: '',
    discapacidad: 'NO',
    tipoDiscapacidad: '',
    porcentajeDiscapacidad: '',
    nee: 'NO',
    usaLentes: 'NO',
    nombresPadre: '',
    cedulaPadre: '',
    telefonoPadre: '',
    ocupacionPadre: '',
    nombresMadre: '',
    cedulaMadre: '',
    telefonoMadre: '',
    ocupacionMadre: '',
    esRepresentante: 'Madre',
    rucFacturacion: '',
    nombreFacturacion: '',
    direccionFacturacion: '',
    telefonoFacturacion: '',
    correoFacturacion: ''
  });

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handlePrev = () => { if (step > 1) setStep(step - 1); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('¡Registro completado! Pronto conectaremos esto con Supabase.');
  };

  const steps = ['Jugador y Cuenta', 'Ficha Médica', 'Datos Familiares', 'Facturación'];

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
            <p className="text-blue-200 text-sm mb-10 leading-relaxed">
              Completa la ficha de matriculación oficial para asegurar tu cupo.
            </p>

            <ul className="space-y-5">
              {steps.map((label, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isDone = step > num;
                return (
                  <li key={num} className={`flex items-center gap-3 text-sm font-semibold transition-colors ${isActive ? 'text-orange-400' : isDone ? 'text-green-400' : 'text-blue-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${isActive ? 'border-orange-400 text-orange-400' : isDone ? 'border-green-400 bg-green-400 text-white' : 'border-blue-400 text-blue-400'}`}>
                      {isDone ? <span className="material-symbols-outlined text-[16px]">check</span> : num}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-12 pt-6 border-t border-blue-700">
            <p className="text-blue-300 text-xs mb-1">¿Ya eres miembro?</p>
            <Link to="/login" className="text-orange-400 hover:underline text-sm font-semibold">Iniciar Sesión</Link>
          </div>
        </div>

        {/* ── Form Area ── */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto max-h-[90vh] md:max-h-none">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
            <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* ── Step 1: Jugador ── */}
            {step === 1 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-6">Paso 1: Datos del Jugador</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Foto */}
                  <PhotoUploader
                    value={fotoJugador}
                    onChange={(dataUrl) => setFotoJugador(dataUrl)}
                  />

                  <div className="md:col-span-2 border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Credenciales de acceso</p>
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass} htmlFor="email">Correo Electrónico</label>
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="ejemplo@correo.com" className={inputClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass} htmlFor="password">Contraseña</label>
                    <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Mínimo 8 caracteres" className={inputClass} />
                  </div>

                  <div className="md:col-span-2 border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Datos del Jugador</p>
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <label className={labelClass}>Nombres Completos del Jugador</label>
                    <input type="text" name="nombresJugador" value={formData.nombresJugador} onChange={handleChange} required placeholder="Apellidos y Nombres completos" className={inputClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Cédula de Identidad</label>
                    <input type="text" name="cedulaJugador" value={formData.cedulaJugador} onChange={handleChange} required pattern="\d{10}" title="Debe contener exactamente 10 dígitos" placeholder="0000000000" className={inputClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Fecha de Nacimiento</label>
                    <input type="date" name="fechaNacimientoJugador" value={formData.fechaNacimientoJugador} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Género</label>
                    <select name="genero" value={formData.genero} onChange={handleChange} required className={selectClass}>
                      <option value="">Seleccione...</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Nacionalidad</label>
                    <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <label className={labelClass}>Dirección Completa</label>
                    <textarea name="direccion" value={formData.direccion} onChange={handleChange} required rows="2" placeholder="Barrio, calle, número..." className={inputClass + " resize-none"}></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Médico ── */}
            {step === 2 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-6">Paso 2: Ficha Médica</h3>
                <p className="text-sm text-gray-500 mb-5">Esta información es confidencial y solo será accesible para el administrador del club.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className={labelClass}>¿Tiene Discapacidad?</label>
                    <select name="discapacidad" value={formData.discapacidad} onChange={handleChange} className={selectClass}>
                      <option value="NO">NO</option>
                      <option value="SI">SÍ</option>
                    </select>
                  </div>
                  {formData.discapacidad === 'SI' && (
                    <>
                      <div className="flex flex-col">
                        <label className={labelClass}>Tipo de Discapacidad</label>
                        <input type="text" name="tipoDiscapacidad" value={formData.tipoDiscapacidad} onChange={handleChange} placeholder="Ej: Auditiva, Visual..." className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Porcentaje de Discapacidad (%)</label>
                        <input type="number" name="porcentajeDiscapacidad" value={formData.porcentajeDiscapacidad} onChange={handleChange} min="1" max="100" className={inputClass} />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col">
                    <label className={labelClass}>¿Necesidades Educativas Especiales (NEE)?</label>
                    <select name="nee" value={formData.nee} onChange={handleChange} className={selectClass}>
                      <option value="NO">NO</option>
                      <option value="SI">SÍ</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>¿Usa Lentes?</label>
                    <select name="usaLentes" value={formData.usaLentes} onChange={handleChange} className={selectClass}>
                      <option value="NO">NO</option>
                      <option value="SI">SÍ</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Familiares ── */}
            {step === 3 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-6">Paso 3: Datos Familiares</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4">Datos del Padre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex flex-col">
                        <label className={labelClass}>Nombres Completos</label>
                        <input type="text" name="nombresPadre" value={formData.nombresPadre} onChange={handleChange} className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Cédula</label>
                        <input type="text" name="cedulaPadre" value={formData.cedulaPadre} onChange={handleChange} placeholder="0000000000" className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Teléfono Móvil</label>
                        <input type="tel" name="telefonoPadre" value={formData.telefonoPadre} onChange={handleChange} placeholder="09XXXXXXXX" className={inputClass} />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <label className={labelClass}>Ocupación</label>
                        <input type="text" name="ocupacionPadre" value={formData.ocupacionPadre} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4">Datos de la Madre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex flex-col">
                        <label className={labelClass}>Nombres Completos</label>
                        <input type="text" name="nombresMadre" value={formData.nombresMadre} onChange={handleChange} className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Cédula</label>
                        <input type="text" name="cedulaMadre" value={formData.cedulaMadre} onChange={handleChange} placeholder="0000000000" className={inputClass} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Teléfono Móvil</label>
                        <input type="tel" name="telefonoMadre" value={formData.telefonoMadre} onChange={handleChange} placeholder="09XXXXXXXX" className={inputClass} />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <label className={labelClass}>Ocupación</label>
                        <input type="text" name="ocupacionMadre" value={formData.ocupacionMadre} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-gray-700 mb-1">¿Quién es el Representante Legal?</label>
                    <select name="esRepresentante" value={formData.esRepresentante} onChange={handleChange} className={selectClass}>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Otro">Otro (se coordinará con el club)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Facturación ── */}
            {step === 4 && (
              <div className="animate-[fadeIn_0.3s_ease-in-out]">
                <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 mb-6">Paso 4: Datos para Facturación</h3>
                <p className="text-sm text-gray-500 mb-5">Estos datos aparecerán en los comprobantes y facturas de pago del club.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className={labelClass}>Cédula o RUC</label>
                    <input type="text" name="rucFacturacion" value={formData.rucFacturacion} onChange={handleChange} required placeholder="0000000000" className={inputClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Teléfono de Contacto</label>
                    <input type="tel" name="telefonoFacturacion" value={formData.telefonoFacturacion} onChange={handleChange} required placeholder="09XXXXXXXX" className={inputClass} />
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <label className={labelClass}>Razón Social / Nombre Completo</label>
                    <input type="text" name="nombreFacturacion" value={formData.nombreFacturacion} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <label className={labelClass}>Dirección de Facturación</label>
                    <input type="text" name="direccionFacturacion" value={formData.direccionFacturacion} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <label className={labelClass}>Correo para envío de facturas</label>
                    <input type="email" name="correoFacturacion" value={formData.correoFacturacion} onChange={handleChange} required placeholder="facturacion@correo.com" className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex justify-between pt-4 border-t border-gray-100 mt-4">
              {step > 1 ? (
                <button type="button" onClick={handlePrev} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Atrás
                </button>
              ) : <div />}

              {step < 4 ? (
                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#001f3f] text-white text-sm font-semibold shadow hover:bg-blue-900 transition-colors">
                  Siguiente <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold shadow hover:bg-orange-600 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span> Completar Registro
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
