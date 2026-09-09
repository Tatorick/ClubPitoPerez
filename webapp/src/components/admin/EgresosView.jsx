import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const CATEGORIAS = ['Equipamiento', 'Infraestructura', 'Personal', 'Eventos', 'Administración', 'Otros'];

const CAT_STYLES = {
  'Equipamiento':   'bg-blue-100 text-blue-700',
  'Infraestructura':'bg-purple-100 text-purple-700',
  'Personal':       'bg-amber-100 text-amber-700',
  'Eventos':        'bg-green-100 text-green-700',
  'Administración': 'bg-gray-100 text-gray-700',
  'Otros':          'bg-red-100 text-red-700',
};

function EgresoForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    monto: '',
    categoria: 'Otros',
    responsable: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion.trim() || !form.monto || Number(form.monto) <= 0) {
      setError('Descripción y monto son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const { data, error: err } = await supabase.from('egresos').insert({
        fecha: form.fecha,
        descripcion: form.descripcion.trim(),
        monto: Number(form.monto),
        categoria: form.categoria,
        responsable: form.responsable.trim() || null,
      }).select().single();
      if (err) throw err;
      onSave(data);
    } catch (err) {
      setError('Error al guardar. Intenta de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-200 outline-none transition-all';
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#001f3f] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">receipt_long</span>
            <h2 className="font-bold text-white">Registrar Egreso</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fecha *</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Monto ($) *</label>
              <input type="number" name="monto" value={form.monto} onChange={handleChange} min="0.01" step="0.01" placeholder="0.00" className={inputCls} required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Descripción *</label>
            <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="ej: Compra de balones, Arriendo de cancha..." className={inputCls} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Categoría</label>
              <select name="categoria" value={form.categoria} onChange={handleChange} className={inputCls}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Responsable</label>
              <input type="text" name="responsable" value={form.responsable} onChange={handleChange} placeholder="Nombre del responsable" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-60">
              {saving ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
              {saving ? 'Guardando...' : 'Guardar Egreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EgresosView() {
  const [egresos, setEgresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('Todos');
  const [filterMes, setFilterMes] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchEgresos();
  }, []);

  const fetchEgresos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('egresos').select('*').order('fecha', { ascending: false });
    if (!error) setEgresos(data || []);
    setLoading(false);
  };

  const handleSave = (nuevo) => {
    setEgresos(prev => [nuevo, ...prev]);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este egreso?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('egresos').delete().eq('id', id);
    if (!error) setEgresos(prev => prev.filter(e => e.id !== id));
    setDeletingId(null);
  };

  const filtered = egresos.filter(e => {
    if (filterCat !== 'Todos' && e.categoria !== filterCat) return false;
    if (filterMes && !e.fecha.startsWith(filterMes)) return false;
    return true;
  });

  const totalFiltrado = filtered.reduce((s, e) => s + Number(e.monto), 0);
  const totalGeneral = egresos.reduce((s, e) => s + Number(e.monto), 0);
  const mesesDisponibles = [...new Set(egresos.map(e => e.fecha.substring(0, 7)))].sort().reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Egresos (General)</p>
          <p className="text-2xl font-bold text-red-600">${totalGeneral.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Egresos (Filtro activo)</p>
          <p className="text-2xl font-bold text-orange-600">${totalFiltrado.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Registros</p>
          <p className="text-2xl font-bold text-gray-700">{filtered.length}</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">trending_down</span>
            Registro de Egresos
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterMes} onChange={e => setFilterMes(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-orange-400">
              <option value="">Todos los meses</option>
              {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-orange-400">
              <option value="Todos">Todas las categorías</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors">
              <span className="material-symbols-outlined text-[14px]">add</span>
              Nuevo Egreso
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-200">receipt_long</span>
            <p className="text-gray-400 text-sm mt-3">No hay egresos registrados aún.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600">
              Registrar primer egreso
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Fecha</th>
                  <th className="px-5 py-3 text-left">Descripción</th>
                  <th className="px-5 py-3 text-left">Categoría</th>
                  <th className="px-5 py-3 text-left">Responsable</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                  <th className="px-5 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{e.fecha}</td>
                    <td className="px-5 py-3 text-gray-800 font-medium max-w-xs">{e.descripcion}</td>
                    <td className="px-5 py-3">
                      <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + (CAT_STYLES[e.categoria] || 'bg-gray-100 text-gray-600')}>
                        {e.categoria}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{e.responsable || '—'}</td>
                    <td className="px-5 py-3 text-right font-bold text-red-600">${Number(e.monto).toFixed(2)}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={4} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Total filtrado</td>
                  <td className="px-5 py-3 text-right font-bold text-red-700 text-base">${totalFiltrado.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {showForm && <EgresoForm onSave={handleSave} onClose={() => setShowForm(false)} />}
    </div>
  );
}
