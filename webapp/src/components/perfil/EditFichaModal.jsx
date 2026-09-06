import { useState } from 'react';
import { supabase } from '../../lib/supabase';

// Helper components for the form
function EditSection({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
      <h4 className="flex items-center gap-2 text-sm font-bold text-[#001f3f] uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
        <span className="material-symbols-outlined text-[18px] text-orange-500">{icon}</span>{title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  );
}

function EditField({ label, name, value, onChange, full, type = 'text', as, options }) {
  const cls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all";
  return (
    <div className={full ? 'col-span-1 sm:col-span-2' : ''}>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {as === 'select' ? (
        <select name={name} value={value} onChange={onChange} className={cls}>
          <option value="">— Seleccionar —</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value || ''} onChange={onChange} className={cls} />
      )}
    </div>
  );
}

export default function EditFichaModal({ fichaData, miembroData, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializar el formulario con una mezcla de fichaData y miembroData
  // Priorizamos fichaData porque es el registro original del usuario
  const [form, setForm] = useState({
    // Datos Deportista
    nombres: fichaData?.nombres_jugador || miembroData?.nombres || '',
    cedula: fichaData?.cedula_jugador || miembroData?.cedula || '',
    fecha_nacimiento: fichaData?.fecha_nacimiento || miembroData?.fecha_nacimiento || '',
    genero: fichaData?.genero || miembroData?.genero || '',
    nacionalidad: fichaData?.nacionalidad || miembroData?.nacionalidad || '',
    direccion: fichaData?.direccion || miembroData?.direccion || '',
    // Ficha Médica
    discapacidad: fichaData?.discapacidad || (miembroData?.discapacidad ? 'SI' : 'NO'),
    tipo_discapacidad: fichaData?.tipo_discapacidad || miembroData?.tipo_discapacidad || '',
    porcentaje_discapacidad: fichaData?.porcentaje_discapacidad || miembroData?.porcentaje_discapacidad || '',
    nee: fichaData?.nee || (miembroData?.necesidades_especiales ? 'SI' : 'NO'),
    usa_lentes: fichaData?.usa_lentes || (miembroData?.usa_lentes ? 'SI' : 'NO'),
    // Padre
    padre_nombres: fichaData?.nombres_padre || miembroData?.padre_nombres || '',
    padre_cedula: fichaData?.cedula_padre || miembroData?.padre_cedula || '',
    padre_telefono: fichaData?.telefono_padre || miembroData?.padre_telefono || '',
    padre_ocupacion: fichaData?.ocupacion_padre || miembroData?.padre_ocupacion || '',
    // Madre
    madre_nombres: fichaData?.nombres_madre || miembroData?.madre_nombres || '',
    madre_cedula: fichaData?.cedula_madre || miembroData?.madre_cedula || '',
    madre_telefono: fichaData?.telefono_madre || miembroData?.madre_telefono || '',
    madre_ocupacion: fichaData?.ocupacion_madre || miembroData?.madre_ocupacion || '',
    // Representante
    representante_legal: fichaData?.representante || miembroData?.representante_legal || '',
    // Facturación
    facturacion_ruc: fichaData?.ruc_facturacion || miembroData?.facturacion_ruc || '',
    facturacion_nombre: fichaData?.nombre_facturacion || miembroData?.facturacion_nombre || '',
    facturacion_direccion: fichaData?.direccion_facturacion || miembroData?.facturacion_direccion || '',
    facturacion_telefono: fichaData?.telefono_facturacion || miembroData?.facturacion_telefono || '',
    facturacion_correo: fichaData?.correo_facturacion || miembroData?.facturacion_correo || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Actualizar en Fichas (si existe)
      if (fichaData?.id) {
        const { error: errFichas } = await supabase.from('fichas').update({
          nombres_jugador: form.nombres,
          cedula_jugador: form.cedula,
          fecha_nacimiento: form.fecha_nacimiento,
          genero: form.genero,
          nacionalidad: form.nacionalidad,
          direccion: form.direccion,
          discapacidad: form.discapacidad,
          tipo_discapacidad: form.tipo_discapacidad,
          porcentaje_discapacidad: form.porcentaje_discapacidad ? parseInt(form.porcentaje_discapacidad, 10) : null,
          nee: form.nee,
          usa_lentes: form.usa_lentes,
          nombres_padre: form.padre_nombres,
          cedula_padre: form.padre_cedula,
          telefono_padre: form.padre_telefono,
          ocupacion_padre: form.padre_ocupacion,
          nombres_madre: form.madre_nombres,
          cedula_madre: form.madre_cedula,
          telefono_madre: form.madre_telefono,
          ocupacion_madre: form.madre_ocupacion,
          representante: form.representante_legal,
          ruc_facturacion: form.facturacion_ruc,
          nombre_facturacion: form.facturacion_nombre,
          direccion_facturacion: form.facturacion_direccion,
          telefono_facturacion: form.facturacion_telefono,
          correo_facturacion: form.facturacion_correo,
        }).eq('id', fichaData.id);
        if (errFichas) throw errFichas;
      }

      // 2. Actualizar en Miembros (si existe)
      if (miembroData?.id) {
        const { error: errMiembros } = await supabase.from('miembros').update({
          nombres: form.nombres,
          cedula: form.cedula,
          fecha_nacimiento: form.fecha_nacimiento,
          genero: form.genero,
          nacionalidad: form.nacionalidad,
          direccion: form.direccion,
          discapacidad: form.discapacidad === 'SI',
          tipo_discapacidad: form.tipo_discapacidad,
          porcentaje_discapacidad: form.porcentaje_discapacidad ? parseInt(form.porcentaje_discapacidad, 10) : null,
          necesidades_especiales: form.nee === 'SI',
          usa_lentes: form.usa_lentes === 'SI',
          padre_nombres: form.padre_nombres,
          padre_cedula: form.padre_cedula,
          padre_telefono: form.padre_telefono,
          padre_ocupacion: form.padre_ocupacion,
          madre_nombres: form.madre_nombres,
          madre_cedula: form.madre_cedula,
          madre_telefono: form.madre_telefono,
          madre_ocupacion: form.madre_ocupacion,
          representante_legal: form.representante_legal,
          facturacion_ruc: form.facturacion_ruc,
          facturacion_nombre: form.facturacion_nombre,
          facturacion_direccion: form.facturacion_direccion,
          facturacion_telefono: form.facturacion_telefono,
          facturacion_correo: form.facturacion_correo,
        }).eq('id', miembroData.id);
        if (errMiembros) throw errMiembros;
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al guardar tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#f8f9fa] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#001f3f] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-400 text-[28px]">edit_document</span>
            <div>
              <h3 className="font-bold text-lg">Actualizar Ficha Médica y Personal</h3>
              <p className="text-xs text-blue-200">Mantén tus datos actualizados para el club.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white text-[24px]">close</span>
          </button>
        </div>

        {/* Cuerpo / Formulario */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form id="edit-ficha-form" onSubmit={handleSubmit}>
            {/* Jugador */}
            <EditSection title="Datos del Jugador" icon="sports_volleyball">
              <EditField label="Nombres Completos" name="nombres" value={form.nombres} onChange={handleChange} full />
              <EditField label="Cédula" name="cedula" value={form.cedula} onChange={handleChange} />
              <EditField label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} />
              <EditField label="Género" name="genero" value={form.genero} onChange={handleChange} as="select" options={['Masculino','Femenino']} />
              <EditField label="Nacionalidad" name="nacionalidad" value={form.nacionalidad} onChange={handleChange} />
              <EditField label="Dirección de Domicilio" name="direccion" value={form.direccion} onChange={handleChange} full />
            </EditSection>
            
            {/* Médica */}
            <EditSection title="Ficha Médica" icon="medical_information">
              <EditField label="¿Tiene alguna discapacidad?" name="discapacidad" value={form.discapacidad} onChange={handleChange} as="select" options={['NO','SI']} />
              {form.discapacidad === 'SI' && (
                <>
                  <EditField label="Tipo de discapacidad" name="tipo_discapacidad" value={form.tipo_discapacidad} onChange={handleChange} />
                  <EditField label="Porcentaje (%)" name="porcentaje_discapacidad" type="number" value={form.porcentaje_discapacidad} onChange={handleChange} />
                </>
              )}
              <EditField label="¿Necesidades Educativas Especiales?" name="nee" value={form.nee} onChange={handleChange} as="select" options={['NO','SI']} />
              <EditField label="¿Usa Lentes?" name="usa_lentes" value={form.usa_lentes} onChange={handleChange} as="select" options={['NO','SI']} />
            </EditSection>

            {/* Representantes */}
            <EditSection title="Datos del Padre" icon="person">
              <EditField label="Nombres" name="padre_nombres" value={form.padre_nombres} onChange={handleChange} full />
              <EditField label="Cédula" name="padre_cedula" value={form.padre_cedula} onChange={handleChange} />
              <EditField label="Teléfono" name="padre_telefono" value={form.padre_telefono} onChange={handleChange} />
              <EditField label="Ocupación" name="padre_ocupacion" value={form.padre_ocupacion} onChange={handleChange} full />
            </EditSection>

            <EditSection title="Datos de la Madre" icon="person">
              <EditField label="Nombres" name="madre_nombres" value={form.madre_nombres} onChange={handleChange} full />
              <EditField label="Cédula" name="madre_cedula" value={form.madre_cedula} onChange={handleChange} />
              <EditField label="Teléfono" name="madre_telefono" value={form.madre_telefono} onChange={handleChange} />
              <EditField label="Ocupación" name="madre_ocupacion" value={form.madre_ocupacion} onChange={handleChange} full />
            </EditSection>

            <EditSection title="Representante Legal" icon="verified_user">
              <EditField label="¿Quién es el representante para el club?" name="representante_legal" value={form.representante_legal} onChange={handleChange} as="select" options={['Madre','Padre','Ambos', 'Otro']} full />
            </EditSection>

            {/* Facturación */}
            <EditSection title="Datos para Facturación Electrónica" icon="receipt">
              <EditField label="Cédula / RUC" name="facturacion_ruc" value={form.facturacion_ruc} onChange={handleChange} />
              <EditField label="Razón Social (Nombre)" name="facturacion_nombre" value={form.facturacion_nombre} onChange={handleChange} />
              <EditField label="Dirección Tributaria" name="facturacion_direccion" value={form.facturacion_direccion} onChange={handleChange} full />
              <EditField label="Teléfono" name="facturacion_telefono" value={form.facturacion_telefono} onChange={handleChange} />
              <EditField label="Correo Electrónico" name="facturacion_correo" value={form.facturacion_correo} onChange={handleChange} type="email" />
            </EditSection>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" form="edit-ficha-form" disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-md">
            {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
            {loading ? 'Guardando Cambios...' : 'Guardar Información'}
          </button>
        </div>

      </div>
    </div>
  );
}
