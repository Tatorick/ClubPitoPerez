import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MemberModal from '../components/admin/MemberModal';
import NewMemberModal from '../components/admin/NewMemberModal';
import ConfigView from '../components/admin/ConfigView';
import EgresosView from '../components/admin/EgresosView';
import BalanceView from '../components/admin/BalanceView';
import { derivarEstadoMeses, startYear, MESES_BASE } from '../utils/pagos';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useClubConfig } from '../hooks/useClubConfig';
import { factureroService } from '../services/factureroService';

// ── Helpers ────────────────────────────────────────────────────────
function getShortRepName(fullName) {
  if (!fullName) return 'Sin representante';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 3) return `${parts[0]} ${parts[2]}`;
  if (parts.length > 1) return `${parts[0]} ${parts[1]}`;
  return parts[0];
}

function getPaymentStatus(transacciones) {
  const meses = derivarEstadoMeses(transacciones);
  const vencidos  = meses.filter(p => p.estado === 'vencido').length;
  const pendientes = meses.filter(p => p.estado === 'pendiente').length;
  if (vencidos > 0) return { color: 'red',    label: `${vencidos} mes${vencidos > 1 ? 'es' : ''} vencido${vencidos > 1 ? 's' : ''}`, icon: 'cancel' };
  if (pendientes > 0) return { color: 'amber', label: 'Pago del mes pendiente', icon: 'schedule' };
  return { color: 'green', label: 'Al día', icon: 'check_circle' };
}

const statusStyle = {
  red:   'bg-red-100 text-red-700 border-red-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  green: 'bg-green-100 text-green-700 border-green-200',
};

// ── Mini calendar strip ────────────────────────────────────────────
function PaymentStrip({ transacciones }) {
  const colors = { pagado: 'bg-green-500', adelanto: 'bg-blue-400', pendiente: 'bg-amber-400', vencido: 'bg-red-500', futuro: 'bg-gray-200' };
  const meses = derivarEstadoMeses(transacciones).filter(p => p.tipo === 'pension');
  return (
    <div className="flex gap-1 items-center">
      {meses.map(p => (
        <div key={p.codigo} title={`${p.codigo}: ${p.estado}`}
             className={`w-2.5 h-2.5 rounded-full ${colors[p.estado]}`} />
      ))}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  const colors = {
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${colors[color]}`}>
      <span className="material-symbols-outlined text-3xl">{icon}</span>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-semibold opacity-80">{label}</div>
      </div>
    </div>
  );
}

// ── Vista: Dashboard Financiero (Módulo 1) ─────────────────────────
function DashboardView({ miembros, precioPension }) {
  const [transacciones, setTransacciones] = useState([]);
  const [loadingTxn, setLoadingTxn] = useState(true);
  const [facturandoId, setFacturandoId] = useState(null);

  const handleEmitirFactura = async (t) => {
    if (!t.miembros) return alert("Faltan datos del deportista");
    try {
      setFacturandoId(t.id);
      
      // 1. Crear/Obtener cliente
      const resCliente = await factureroService.crearCliente({
        cedula: t.miembros.cedula,
        nombre: t.miembros.nombres,
        direccion: "Quito",
        telefono: t.miembros.madre_telefono || t.miembros.padre_telefono || "0999999999",
        email: "correo@ejemplo.com" // Podríamos pedir esto en el registro en el futuro
      });
      
      // Dependiendo de la API, usamos el ID retornado
      const clienteId = resCliente?.id || resCliente?.cliente?.id || 43604; // fallback de prueba
      
      // 2. Emitir factura
      const resFactura = await factureroService.emitirFactura(clienteId, t.monto_real);
      
      // 3. Actualizar transacción en Supabase
      const { error } = await supabase
        .from('transacciones')
        .update({ 
          factura_id: resFactura.numeroDocumento || 'TBD',
          factura_pdf: resFactura.pdf || '',
          factura_xml: resFactura.xml || ''
        })
        .eq('id', t.id);

      if (error) throw error;

      // 4. Reflejar en la UI
      setTransacciones(prev => prev.map(tx => tx.id === t.id ? {
        ...tx, 
        factura_id: resFactura.numeroDocumento,
        factura_pdf: resFactura.pdf,
        factura_xml: resFactura.xml
      } : tx));
      
      alert("Factura emitida exitosamente");
    } catch (error) {
      console.error("Error al facturar:", error);
      alert("Ocurrió un error al emitir la factura: " + error.message);
    } finally {
      setFacturandoId(null);
    }
  };

  useEffect(() => {
    const fetchTxn = async () => {
      setLoadingTxn(true);
      const { data } = await supabase
        .from('transacciones')
        .select('*, miembros(*)')
        .order('fecha_pago', { ascending: false });
      setTransacciones(data || []);
      setLoadingTxn(false);
    };
    fetchTxn();
  }, []);

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  // Solo transacciones aprobadas
  const aprobadas = transacciones.filter(t => t.estado_verificacion === 'aprobado' || !t.estado_verificacion);

  // Ingresos del mes actual
  const ingresosMes = aprobadas
    .filter(t => {
      if (!t.fecha_pago) return false;
      const d = new Date(t.fecha_pago);
      return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    })
    .reduce((s, t) => s + Number(t.monto_real || 0), 0);

  // Ingresos totales del año lectivo
  const ingresosAnio = aprobadas.reduce((s, t) => s + Number(t.monto_real || 0), 0);

  // Deuda pendiente: meses vencidos de todos los miembros
  const deudaTotal = miembros.reduce((sum, m) => {
    const desc = Number(m.descuento_porcentaje || 0);
    const mesesVenc = derivarEstadoMeses(m.transacciones, precioPension, desc, undefined, m.monto_pension)
      .filter(mes => mes.estado === 'vencido');
    return sum + mesesVenc.reduce((s, mes) => s + mes.montoPension, 0);
  }, 0);

  const alDia = miembros.filter(m => getPaymentStatus(m.transacciones).color === 'green').length;
  const deudores = miembros.filter(m => getPaymentStatus(m.transacciones).color === 'red').length;
  const conDescuento = miembros.filter(m => Number(m.descuento_porcentaje || 0) > 0).length;

  // Recaudación por mes para el gráfico
  const recaudacionPorMes = MESES_BASE.filter(m => m.tipo === 'pension').map(mes => {
    const total = aprobadas
      .filter(t => {
        if (!t.fecha_pago) return false;
        const d = new Date(t.fecha_pago);
        return d.getMonth() === mes.mesIdx && d.getFullYear() === mes.anio;
      })
      .reduce((s, t) => s + Number(t.monto_real || 0), 0);
    return { ...mes, total };
  });
  const maxBar = Math.max(...recaudacionPorMes.map(m => m.total), 1);

  const ultimas = transacciones.slice(0, 10);

  // Exportar CSV (Módulo 4)
  const exportarCSV = () => {
    const filas = [
      ['Nombre', 'Fecha', 'Monto', 'Meses Cubiertos', 'Estado'],
      ...aprobadas.map(t => [
        t.miembros?.nombres || '—',
        t.fecha_pago || '—',
        `$${Number(t.monto_real || 0).toFixed(2)}`,
        (t.meses_cubiertos || []).join(' / '),
        t.estado_verificacion || 'aprobado',
      ])
    ];
    const csv = filas.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos_${startYear}-${startYear + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-green-600">payments</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-green-600">${ingresosMes.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos (Año Lectivo)</p>
              <p className="text-2xl font-bold text-blue-700">${ingresosAnio.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-600">warning</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deuda Pendiente</p>
              <p className="text-2xl font-bold text-red-600">${deudaTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Al Día</p>
              <p className="text-2xl font-bold text-green-700">{alDia}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500">person_off</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deudores</p>
              <p className="text-2xl font-bold text-red-600">{deudores}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-600">star</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Con Beca/Desc.</p>
              <p className="text-2xl font-bold text-amber-700">{conDescuento}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de recaudación por mes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">bar_chart</span>
            Recaudación Mensual — Ciclo {startYear}/{startYear + 1}
          </h3>
          <button onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-[14px]">download</span>
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-3 min-w-max pb-2" style={{ height: '180px' }}>
            {recaudacionPorMes.map(mes => (
              <div key={mes.codigo} className="flex flex-col items-center gap-1.5" style={{ width: '48px' }}>
                <span className="text-[9px] font-bold text-green-600">{mes.total > 0 ? `$${mes.total.toFixed(0)}` : ''}</span>
                <div
                  className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-md transition-all hover:opacity-80 cursor-default"
                  style={{ height: `${(mes.total / maxBar) * 120}px`, minHeight: mes.total > 0 ? '4px' : '0' }}
                  title={`${mes.nombre}: $${mes.total.toFixed(2)}`}
                />
                <span className="text-[9px] text-gray-400 font-bold">{mes.codigo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas transacciones */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">receipt_long</span>
            Últimas Transacciones
          </h3>
          {loadingTxn && <span className="material-symbols-outlined text-gray-300 animate-spin text-[18px]">progress_activity</span>}
        </div>
        {ultimas.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {loadingTxn ? 'Cargando...' : 'No hay transacciones registradas aún.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Deportista</th>
                  <th className="px-5 py-3 text-left">Fecha</th>
                  <th className="px-5 py-3 text-left">Meses</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                  <th className="px-5 py-3 text-center">Factura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ultimas.map(t => {
                  const est = t.estado_verificacion;
                  const badge = est === 'aprobado' || !est
                    ? 'bg-green-100 text-green-700'
                    : est === 'rechazado'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700';
                  const label = est === 'aprobado' || !est ? 'Aprobado' : est === 'rechazado' ? 'Rechazado' : 'En revisión';
                  
                  const isAprobado = est === 'aprobado' || !est;
                  const hasFactura = !!t.factura_pdf;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{t.miembros?.nombres || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{t.fecha_pago || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{(t.meses_cubiertos || []).join(', ') || '—'}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-800">${Number(t.monto_real || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>{label}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {hasFactura ? (
                          <a href={t.factura_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                            Ver
                          </a>
                        ) : isAprobado ? (
                          <button 
                            onClick={() => handleEmitirFactura(t)}
                            disabled={facturandoId === t.id}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-green-500 px-2 py-1 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            {facturandoId === t.id ? (
                              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[14px]">receipt</span>
                            )}
                            Emitir
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Vista: Miembros ────────────────────────────────────────────────
function MiembrosView({ onOpenMember, miembros, loading, precioPension }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400">
        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  const q = debouncedSearch.toLowerCase();
  const filtered = miembros.filter(m =>
    (m.nombres || '').toLowerCase().includes(q) ||
    (m.cedula || '').includes(debouncedSearch)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Miembros" value={miembros.length} icon="groups" color="blue" />
        <StatCard label="Al Día" value={miembros.filter(m => getPaymentStatus(m.transacciones).color === 'green').length} icon="check_circle" color="green" />
        <StatCard label="Pendientes" value={miembros.filter(m => getPaymentStatus(m.transacciones).color === 'amber').length} icon="schedule" color="amber" />
        <StatCard label="Deudores" value={miembros.filter(m => getPaymentStatus(m.transacciones).color === 'red').length} icon="warning" color="red" />
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-gray-800">Directorio de Miembros</h3>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              placeholder="Buscar por nombre o cédula..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-500 text-sm">No hay miembros registrados aún.</p>
          ) : filtered.map(member => {
            const status = getPaymentStatus(member.transacciones);
            const isMadre = member.representante_legal === 'Madre';
            const repNombres = getShortRepName(isMadre ? member.madre_nombres : member.padre_nombres);
            const repTelefono = isMadre ? member.madre_telefono : member.padre_telefono;
            return (
              <div key={member.id} className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#001f3f] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {(member.nombres || '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{member.nombres}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyle[status.color]}`}>
                      <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">C.I. {member.cedula}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">{member.categoria}</span>
                    {Number(member.descuento_porcentaje) > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 rounded-full border border-green-300">
                        ⭐ {member.descuento_porcentaje}% DESC.
                      </span>
                    )}
                    <PaymentStrip transacciones={member.transacciones} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{repNombres} · {repTelefono || ''}</p>
                </div>
                <button onClick={() => onOpenMember(member)} className="shrink-0 p-2 rounded-lg bg-[#001f3f] text-white hover:bg-blue-900 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Jugador</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Representante</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pagos (SEP–JUL)</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-500 text-sm">No hay miembros registrados aún.</td></tr>
              ) : filtered.map(member => {
                const status = getPaymentStatus(member.transacciones);
                const isMadre = member.representante_legal === 'Madre';
                const repNombres = getShortRepName(isMadre ? member.madre_nombres : member.padre_nombres);
                const repTelefono = isMadre ? member.madre_telefono : member.padre_telefono;
                return (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#001f3f] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {(member.nombres || '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm leading-tight">{member.nombres}</p>
                          <p className="text-xs text-gray-400">C.I. {member.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">{member.categoria}</span>
                        {Number(member.descuento_porcentaje) > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-800 rounded-full border border-green-300">
                            {member.descuento_porcentaje}% DESC.
                          </span>
                        )}
                        {(member.tiene_beca === true || (member.monto_pension && Number(member.monto_pension) < 55 && Number(member.descuento_porcentaje) === 0)) && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px] text-amber-600">star</span>
                            Beca
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 font-medium leading-tight">{repNombres?.split(' ').slice(0,2).join(' ') || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{repTelefono || 'Sin teléfono'}</p>
                    </td>
                    <td className="px-5 py-4"><PaymentStrip transacciones={member.transacciones} /></td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle[status.color]}`}>
                        <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => onOpenMember(member)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#001f3f] text-white text-xs font-semibold hover:bg-blue-900 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ── Admin Principal ────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const { precioPension } = useClubConfig();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMiembros = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('miembros').select('*, transacciones(*)');
      if (error) console.error('Error fetching miembros:', error);
      else setMiembros(data || []);
      setLoading(false);
    };
    fetchMiembros();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleMemberAdded = (newMember) => setMiembros(prev => [{ ...newMember, transacciones: [] }, ...prev]);
  const handleMemberDeleted = (memberId) => setMiembros(prev => prev.filter(m => m.id !== memberId));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  icon: 'dashboard' },
    { id: 'miembros',  label: 'Miembros',   icon: 'group' },
    { id: 'egresos',   label: 'Egresos',    icon: 'trending_down' },
    { id: 'balance',   label: 'Balance',    icon: 'account_balance' },
    { id: 'config',    label: 'Ajustes',    icon: 'settings' },
  ];

  const tabTitles = {
    dashboard: 'Dashboard Financiero',
    miembros:  'Directorio de Miembros',
    egresos:   'Registro de Egresos',
    balance:   'Balance Mensual',
    config:    'Ajustes del Club',
  };

  return (
    <div className="flex h-screen bg-gray-100 font-body-md overflow-hidden">
      {/* ── Sidebar ── */}
      <nav className="hidden lg:flex flex-col h-screen w-64 bg-[#001f3f] shadow-xl fixed left-0 top-0 z-40">
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img alt="Logo" className="w-full h-full object-cover"
              src="/logo_club.png" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Portal Admin</p>
            <p className="text-blue-300 text-xs">Pito Pérez V.C.</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-4 flex-grow">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === item.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/editor" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 transition-all">
            <span className="material-symbols-outlined text-[20px]">edit_document</span>Editor CMS
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[20px]">home</span>Volver al sitio
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-900/40 transition-all w-full text-left">
            <span className="material-symbols-outlined text-[20px]">logout</span>Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="lg:ml-64 flex-grow flex flex-col overflow-y-auto pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-base md:text-xl font-bold text-gray-800">{tabTitles[activeTab]}</h1>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Año lectivo {startYear} - {startYear + 1}</p>
          </div>
          {activeTab === 'miembros' && (
            <button onClick={() => setShowNewMemberModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span className="hidden sm:inline">Nuevo Miembro</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </header>

        <div className="p-4 md:p-6">
          {activeTab === 'dashboard' && <DashboardView miembros={miembros} precioPension={precioPension} />}
          {activeTab === 'miembros'  && <MiembrosView onOpenMember={setSelectedMember} miembros={miembros} loading={loading} precioPension={precioPension} />}
          {activeTab === 'egresos'   && <EgresosView />}
          {activeTab === 'balance'   && <BalanceView />}
          {activeTab === 'config'    && <ConfigView />}
        </div>
      </main>

      {/* ── Bottom Nav Mobile ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#001f3f] border-t border-white/10 flex overflow-x-auto">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-semibold transition-colors min-w-[52px] ${
              activeTab === item.id ? 'text-orange-400' : 'text-blue-300 hover:text-white'
            }`}>
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <Link to="/editor" className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-semibold text-orange-400 hover:text-orange-300 transition-colors min-w-[52px]">
          <span className="material-symbols-outlined text-[20px]">edit_document</span>Editor
        </Link>
        <button onClick={handleLogout} className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors min-w-[52px]">
          <span className="material-symbols-outlined text-[20px]">logout</span>Salir
        </button>
      </nav>

      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onDelete={handleMemberDeleted}
          onUpdateMember={(updated) => {
            setSelectedMember(updated);
            setMiembros(prev => prev.map(m => m.id === updated.id ? updated : m));
          }}
        />
      )}
      
      {showNewMemberModal && (
        <NewMemberModal
          onClose={() => setShowNewMemberModal(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}
