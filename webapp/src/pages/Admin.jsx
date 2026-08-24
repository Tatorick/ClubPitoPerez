import { useState } from 'react';
import { Link } from 'react-router-dom';
import MemberModal from '../components/admin/MemberModal';
import { MOCK_MEMBERS, derivarEstadoMeses } from '../data/mockMembers';

// ── Helpers ────────────────────────────────────────────────────────
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

// ── Vista: Miembros ────────────────────────────────────────────────
function MiembrosView({ onOpenMember }) {
  const [search, setSearch] = useState('');
  const filtered = MOCK_MEMBERS.filter(m =>
    m.nombres.toLowerCase().includes(search.toLowerCase()) ||
    m.cedula.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Miembros" value={MOCK_MEMBERS.length} icon="groups" color="blue" />
        <StatCard label="Al Día" value={MOCK_MEMBERS.filter(m => getPaymentStatus(m.transacciones).color === 'green').length} icon="check_circle" color="green" />
        <StatCard label="Pendientes" value={MOCK_MEMBERS.filter(m => getPaymentStatus(m.transacciones).color === 'amber').length} icon="schedule" color="amber" />
        <StatCard label="Deudores" value={MOCK_MEMBERS.filter(m => getPaymentStatus(m.transacciones).color === 'red').length} icon="warning" color="red" />
      </div>

      {/* Table */}
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

        <div className="overflow-x-auto">
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
              {filtered.map(member => {
                const status = getPaymentStatus(member.transacciones);
                const rep = member.representante === 'Madre' ? member.madre : member.padre;
                return (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#001f3f] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {member.nombres.split(' ').map(n=>n[0]).slice(0,2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm leading-tight">{member.nombres}</p>
                          <p className="text-xs text-gray-400">C.I. {member.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">{member.categoria}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 font-medium leading-tight">{rep?.nombres?.split(' ').slice(0,2).join(' ')}</p>
                      <p className="text-xs text-gray-400">{rep?.telefono}</p>
                    </td>
                    <td className="px-5 py-4">
                      <PaymentStrip transacciones={member.transacciones} />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle[status.color]}`}>
                        <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onOpenMember(member)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#001f3f] text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
                      >
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

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Mostrando {filtered.length} de {MOCK_MEMBERS.length} miembros</span>
          <div className="flex gap-1">
            <div className="flex gap-3 text-xs text-gray-500 items-center">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Pagado</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>Pendiente</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Vencido</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Vista: Pagos / Ingresos ────────────────────────────────────────
function PagosView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ingresos Totales (YTD)</p>
          <h3 className="text-3xl font-bold text-[#001f3f]">$4,830</h3>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% vs año anterior
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Deuda Total</p>
          <h3 className="text-3xl font-bold text-red-600">$560</h3>
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span> 4 meses vencidos en total
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Membresías Activas</p>
          <h3 className="text-3xl font-bold text-[#001f3f]">3</h3>
          <p className="text-xs text-gray-400 mt-2">Año lectivo 2024–2025</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Últimas Transacciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Miembro</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Concepto</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {[
                { nombre: 'Juliana Pérez',   concepto: 'Pensión FEB',  fecha: '03/02/2025', monto: '$35.00', estado: 'pagado' },
                { nombre: 'Jessica Smith',   concepto: 'Pensión OCT',  fecha: '05/10/2024', monto: '$40.00', estado: 'pagado' },
                { nombre: 'Ana Torres',      concepto: 'Pensión MAR',  fecha: '04/03/2025', monto: '$35.00', estado: 'pagado' },
                { nombre: 'Jessica Smith',   concepto: 'Pensión NOV',  fecha: null,          monto: '$40.00', estado: 'vencido' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{row.nombre}</td>
                  <td className="px-5 py-3 text-gray-600">{row.concepto}</td>
                  <td className="px-5 py-3 text-gray-500">{row.fecha || '—'}</td>
                  <td className="px-5 py-3 font-bold text-gray-800">{row.monto}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle[row.estado === 'pagado' ? 'green' : 'red']}`}>
                      {row.estado === 'pagado' ? 'Pagado' : 'Vencido'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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

// ── Admin Principal ────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState('miembros');
  const [selectedMember, setSelectedMember] = useState(null);

  const navItems = [
    { id: 'pagos',    label: 'Ingresos',  icon: 'payments' },
    { id: 'miembros', label: 'Miembros',  icon: 'group' },
    { id: 'config',   label: 'Ajustes',   icon: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-body-md overflow-hidden">

      {/* ── Sidebar ── */}
      <nav className="hidden lg:flex flex-col h-screen w-64 bg-[#001f3f] shadow-xl fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img alt="Logo" className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXDDAI55wedoCiQm3_bC4Z1j9JIF9mFR67JUDdt386qaJxIHKhTUgdMXivwI1uji69h9fy8AeFtXmDrvj0Z0L8nm9NXpJh7CByz-vjhmikLahd96mXP2sze-Ui6qcpoYK0_2fzOZmyQsCk1_NqPM8sAMHoFqRG3Fv9hS3MFC3cQehtecZc1sUf4dJO_b8ceNixf2IM1Xx4lvUvxALi96jRztUSkM4CDyvjWxXCQ-9R5-Mzo1n0HzhkxbiZgvIe-nxBIA" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Portal Admin</p>
            <p className="text-blue-300 text-xs">Pito Pérez V.C.</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-1 p-4 flex-grow">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === item.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[20px]">home</span>
            Volver al sitio
          </Link>
          <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-900/40 transition-all">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Cerrar Sesión
          </Link>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="lg:ml-64 flex-grow flex flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {activeTab === 'pagos'    ? 'Ingresos y Pagos'       : ''}
              {activeTab === 'miembros' ? 'Directorio de Miembros'  : ''}
              {activeTab === 'config'   ? 'Ajustes'                 : ''}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Año lectivo 2024 – 2025</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Exportar
            </button>
            <button
              onClick={() => setActiveTab('miembros')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Nuevo Miembro
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'pagos'    && <PagosView />}
          {activeTab === 'miembros' && <MiembrosView onOpenMember={setSelectedMember} />}
          {activeTab === 'config'   && (
            <div className="text-gray-500 text-sm p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">settings</span>
              Configuración del portal (próximamente)
            </div>
          )}
        </div>
      </main>

      {/* ── Member Modal ── */}
      {selectedMember && (
        <MemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
