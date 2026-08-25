import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function NewMemberModal({ onClose, onMemberAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  
  // ─── ESTADO DEL FORMULARIO ──────────────────────────────
  const [formData, setFormData] = useState({
    nombres: '',
    cedula: '',
    fecha_nacimiento: '',
    genero: 'Femenino',
    nacionalidad: 'Ecuatoriana',
    direccion: '',
    categoria: 'U12',
    tiene_beca: false,
    tipo_beca: '',
    monto_pension: 55,
    
    tiene_discapacidad: false,
    tipo_discapacidad: '',
    porcentaje_discapacidad: '',
    necesidades_especiales: false,
    usa_lentes: false,
    
    padre_nombres: '',
    padre_cedula: '',
    padre_telefono: '',
    padre_ocupacion: '',
    
    madre_nombres: '',
    madre_cedula: '',
    madre_telefono: '',
    madre_ocupacion: '',
    
    representante_legal: 'Madre',
    facturacion_ruc: '',
    facturacion_nombre: '',
    facturacion_direccion: '',
    facturacion_telefono: '',
    facturacion_correo: '',
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = ev => setFotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Función para autocompletar la facturación si es el mismo que el representante
  const autofillBilling = () => {
    const rep = formData.representante_legal;
    if (rep === 'Madre') {
      setFormData(prev => ({ ...prev, facturacion_ruc: prev.madre_cedula, facturacion_nombre: prev.madre_nombres, facturacion_telefono: prev.madre_telefono }));
    } else if (rep === 'Padre') {
      setFormData(prev => ({ ...prev, facturacion_ruc: prev.padre_cedula, facturacion_nombre: prev.padre_nombres, facturacion_telefono: prev.padre_telefono }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let foto_url = null;

      // 1. Subir la foto si existe
      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${formData.cedula}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('fichas')
          .upload(fileName, fotoFile);
          
        if (uploadError) throw new Error('Error al subir la foto: ' + uploadError.message);
        
        // Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from('fichas')
          .getPublicUrl(fileName);
          
        foto_url = publicUrlData.publicUrl;
      }

      // 2. Preparar el objeto para insertar
      const insertData = { ...formData, foto_url };
      
      // Convertir porcentaje de discapacidad a número si tiene algo, si no null
      if (insertData.tiene_discapacidad && insertData.porcentaje_discapacidad) {
        insertData.porcentaje_discapacidad = parseInt(insertData.porcentaje_discapacidad, 10);
      } else {
        insertData.porcentaje_discapacidad = null;
      }

      // 3. Insertar en Supabase
      const { data, error: dbError } = await supabase
        .from('miembros')
        .insert([insertData])
        .select()
        .single();

      if (dbError) throw new Error('Error al guardar en base de datos: ' + dbError.message);

      // Éxito
      if (onMemberAdded) onMemberAdded(data);
      onClose();
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#001f3f]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white">person_add</span>
            <h2 className="font-bold text-white text-lg leading-tight">Inscribir Nuevo Miembro</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form id="new-member-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Foto */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative group cursor-pointer" onClick={() => fileRef.current.click()}>
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-gray-400 text-3xl">add_a_photo</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-2xl">edit</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Foto de Perfil</h4>
                <p className="text-sm text-gray-500 mb-2">Sube una foto clara del rostro del jugador para su ficha.</p>
                <button type="button" onClick={() => fileRef.current.click()} className="text-sm font-semibold text-blue-600 hover:underline">
                  Seleccionar archivo...
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sección 1: Datos Personales */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#001f3f] border-b pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">sports_volleyball</span> Datos del Jugador
                </h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Nombres y Apellidos *</label>
                  <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Cédula *</label>
                    <input type="text" name="cedula" required value={formData.cedula} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Fecha de Nacimiento *</label>
                    <input type="date" name="fecha_nacimiento" required value={formData.fecha_nacimiento} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Género *</label>
                    <select name="genero" required value={formData.genero} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                      <option>Femenino</option>
                      <option>Masculino</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Categoría *</label>
                    <select name="categoria" required value={formData.categoria} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                      <option>U12</option>
                      <option>U14</option>
                      <option>U16</option>
                      <option>U18</option>
                      <option>Mayores</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">star</span>
                      ¿Tiene Beca / Descuento?
                    </label>
                    <select
                      name="tiene_beca"
                      value={formData.tiene_beca ? 'SI' : 'NO'}
                      onChange={e => {
                        const hasBeca = e.target.value === 'SI';
                        setFormData(prev => ({
                          ...prev,
                          tiene_beca: hasBeca,
                          monto_pension: hasBeca ? 25 : 55,
                          tipo_beca: hasBeca ? 'Beca Deportiva' : ''
                        }));
                      }}
                      className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="NO">No (Pensión Regular $55)</option>
                      <option value="SI">Sí (Becado/a)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-900">Monto Mensual Asignado ($ USD)</label>
                    <input
                      type="number"
                      name="monto_pension"
                      step="0.01"
                      min="0"
                      value={formData.monto_pension}
                      onChange={handleChange}
                      className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white font-bold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Dirección Domiciliaria</label>
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              {/* Sección 2: Médica */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#001f3f] border-b pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">medical_information</span> Ficha Médica
                </h3>

                <div className="flex gap-6 mt-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" name="tiene_discapacidad" checked={formData.tiene_discapacidad} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    Tiene Discapacidad
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" name="usa_lentes" checked={formData.usa_lentes} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    Usa Lentes
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" name="necesidades_especiales" checked={formData.necesidades_especiales} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    NEE
                  </label>
                </div>

                {formData.tiene_discapacidad && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg mt-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600">Tipo Discapacidad</label>
                      <input type="text" name="tipo_discapacidad" value={formData.tipo_discapacidad} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600">% Porcentaje</label>
                      <input type="number" name="porcentaje_discapacidad" value={formData.porcentaje_discapacidad} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Padres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Madre */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#001f3f] border-b pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">face_3</span> Datos de la Madre
                </h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Nombres y Apellidos</label>
                  <input type="text" name="madre_nombres" value={formData.madre_nombres} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Cédula</label>
                    <input type="text" name="madre_cedula" value={formData.madre_cedula} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Teléfono</label>
                    <input type="text" name="madre_telefono" value={formData.madre_telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Padre */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#001f3f] border-b pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">face</span> Datos del Padre
                </h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Nombres y Apellidos</label>
                  <input type="text" name="padre_nombres" value={formData.padre_nombres} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Cédula</label>
                    <input type="text" name="padre_cedula" value={formData.padre_cedula} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600">Teléfono</label>
                    <input type="text" name="padre_telefono" value={formData.padre_telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Facturación */}
            <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-[#001f3f] flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">receipt_long</span> Representante y Facturación
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Autocompletar con:</span>
                  <button type="button" onClick={autofillBilling} className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 rounded hover:bg-gray-200 transition-colors">Datos del Rep. Legal</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Rep. Legal *</label>
                  <select name="representante_legal" required value={formData.representante_legal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option>Madre</option>
                    <option>Padre</option>
                    <option>Ambos</option>
                    <option>Otro</option>
                  </select>
                </div>
                
                <div className="space-y-1 md:col-span-3">
                  <label className="text-xs font-bold text-gray-600">Razón Social a Facturar *</label>
                  <input type="text" name="facturacion_nombre" required value={formData.facturacion_nombre} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Cédula / RUC *</label>
                  <input type="text" name="facturacion_ruc" required value={formData.facturacion_ruc} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Teléfono</label>
                  <input type="text" name="facturacion_telefono" value={formData.facturacion_telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-gray-600">Correo Electrónico</label>
                  <input type="email" name="facturacion_correo" value={formData.facturacion_correo} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="new-member-form" disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
            {loading ? (
              <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Guardando...</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">save</span> Guardar Miembro</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
