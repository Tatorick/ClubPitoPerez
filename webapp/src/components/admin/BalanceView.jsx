import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MESES_BASE, startYear } from '../../utils/pagos';

const MESES_NOMBRES = {
  'MAT': 'Matrícula', 'SEP': 'Septiembre', 'OCT': 'Octubre', 'NOV': 'Noviembre',
  'DIC': 'Diciembre', 'ENE': 'Enero', 'FEB': 'Febrero', 'MAR': 'Marzo',
  'ABR': 'Abril', 'MAY': 'Mayo', 'JUN': 'Junio', 'JUL': 'Julio', 'AGO': 'Agosto',
};

// Mapa mesIdx → código del mes
const IDX_A_CODIGO = {
  8: 'SEP', 9: 'OCT', 10: 'NOV', 11: 'DIC',
  0: 'ENE', 1: 'FEB', 2: 'MAR', 3: 'ABR', 4: 'MAY', 5: 'JUN', 6: 'JUL', 7: 'AGO',
};

// Fecha ISO de inicio de un mes dado su anio y mesIdx
function fechaInicioMes(anio, mesIdx) {
  return `${anio}-${String(mesIdx + 1).padStart(2, '0')}-01`;
}
function fechaFinMes(anio, mesIdx) {
  const d = new Date(anio, mesIdx + 1, 0);
  return d.toISOString().split('T')[0];
}

export default function BalanceView() {
  const [transacciones, setTransacciones] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [txnRes, egRes] = await Promise.all([
        supabase.from('transacciones').select('*').eq('estado_verificacion', 'aprobado'),
        supabase.from('egresos').select('*'),
      ]);
      setTransacciones(txnRes.data || []);
      setEgresos(egRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Calcular ingresos por mes basado en fecha_pago de las transacciones aprobadas
  const ingresosPorMes = {};
  transacciones.forEach(t => {
    if (!t.fecha_pago) return;
    const fecha = new Date(t.fecha_pago);
    const anio = fecha.getFullYear();
    const mesIdx = fecha.getMonth();
    const codigo = IDX_A_CODIGO[mesIdx];
    if (!codigo) return;
    // Verificar que corresponde al año lectivo actual
    const clave = `${anio}-${mesIdx}`;
    if (!ingresosPorMes[clave]) ingresosPorMes[clave] = 0;
    ingresosPorMes[clave] += Number(t.monto_real || 0);
  });

  // Calcular egresos por mes basado en fecha del egreso
  const egresosPorMes = {};
  egresos.forEach(e => {
    if (!e.fecha) return;
    const fecha = new Date(e.fecha);
    const anio = fecha.getFullYear();
    const mesIdx = fecha.getMonth();
    const clave = `${anio}-${mesIdx}`;
    if (!egresosPorMes[clave]) egresosPorMes[clave] = 0;
    egresosPorMes[clave] += Number(e.monto || 0);
  });

  // Construir tabla de balance por cada mes del ciclo escolar
  const balancePorMes = MESES_BASE.map(mes => {
    const clave = `${mes.anio}-${mes.mesIdx}`;
    const ingresos = ingresosPorMes[clave] || 0;
    const egresosVal = egresosPorMes[clave] || 0;
    const balance = ingresos - egresosVal;
    return {
      codigo: mes.codigo,
      nombre: MESES_NOMBRES[mes.codigo] || mes.codigo,
      anio: mes.anio,
      ingresos,
      egresos: egresosVal,
      balance,
    };
  });

  const totalIngresos = balancePorMes.reduce((s, m) => s + m.ingresos, 0);
  const totalEgresos = balancePorMes.reduce((s, m) => s + m.egresos, 0);
  const totalBalance = totalIngresos - totalEgresos;

  // Para el gráfico de barras simple
  const maxVal = Math.max(...balancePorMes.map(m => Math.max(m.ingresos, m.egresos)), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-gray-300 animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">trending_up</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">${totalIngresos.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600">trending_down</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Egresos Totales</p>
              <p className="text-2xl font-bold text-red-600">${totalEgresos.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className={"bg-white rounded-2xl border p-5 shadow-sm " + (totalBalance >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')}>
          <div className="flex items-center gap-3">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (totalBalance >= 0 ? 'bg-green-200' : 'bg-red-200')}>
              <span className={"material-symbols-outlined " + (totalBalance >= 0 ? 'text-green-700' : 'text-red-700')}>
                {totalBalance >= 0 ? 'account_balance' : 'warning'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Balance Neto</p>
              <p className={"text-2xl font-bold " + (totalBalance >= 0 ? 'text-green-700' : 'text-red-700')}>
                {totalBalance >= 0 ? '+' : ''}${totalBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de barras visual */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">bar_chart</span>
          Ingresos vs Egresos por Mes — Ciclo {startYear}/{startYear + 1}
        </h3>
        <div className="flex gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span>Ingresos</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 inline-block"></span>Egresos</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-2 min-w-max pb-2" style={{ height: '180px' }}>
            {balancePorMes.map(mes => (
              <div key={mes.codigo} className="flex flex-col items-center gap-1" style={{ width: '52px' }}>
                <div className="flex items-end gap-0.5" style={{ height: '140px' }}>
                  {/* Barra ingresos */}
                  <div
                    className="w-5 bg-green-500 rounded-t-sm transition-all hover:opacity-80 cursor-default"
                    style={{ height: `${(mes.ingresos / maxVal) * 140}px`, minHeight: mes.ingresos > 0 ? '3px' : '0' }}
                    title={`Ingresos ${mes.nombre}: $${mes.ingresos.toFixed(2)}`}
                  />
                  {/* Barra egresos */}
                  <div
                    className="w-5 bg-red-400 rounded-t-sm transition-all hover:opacity-80 cursor-default"
                    style={{ height: `${(mes.egresos / maxVal) * 140}px`, minHeight: mes.egresos > 0 ? '3px' : '0' }}
                    title={`Egresos ${mes.nombre}: $${mes.egresos.toFixed(2)}`}
                  />
                </div>
                <span className="text-[9px] text-gray-400 font-bold text-center leading-tight">{mes.codigo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">table_chart</span>
            Balance Mensual Detallado
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Mes</th>
                <th className="px-5 py-3 text-right">Ingresos</th>
                <th className="px-5 py-3 text-right">Egresos</th>
                <th className="px-5 py-3 text-right">Balance</th>
                <th className="px-5 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {balancePorMes.map(mes => (
                <tr key={mes.codigo} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-gray-700">
                    {mes.nombre}
                    <span className="text-xs text-gray-400 ml-1">{mes.anio}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-green-600 font-semibold">
                    {mes.ingresos > 0 ? `$${mes.ingresos.toFixed(2)}` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-red-500 font-semibold">
                    {mes.egresos > 0 ? `$${mes.egresos.toFixed(2)}` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className={"px-5 py-3 text-right font-bold " + (mes.balance > 0 ? 'text-green-700' : mes.balance < 0 ? 'text-red-700' : 'text-gray-400')}>
                    {mes.ingresos === 0 && mes.egresos === 0
                      ? <span className="text-gray-300">—</span>
                      : `${mes.balance >= 0 ? '+' : ''}$${mes.balance.toFixed(2)}`
                    }
                  </td>
                  <td className="px-5 py-3 text-center">
                    {mes.ingresos === 0 && mes.egresos === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400">Sin datos</span>
                    ) : mes.balance >= 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">✓ Superávit</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">⚠ Déficit</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                <td className="px-5 py-3 text-xs uppercase tracking-wider text-gray-500">TOTAL AÑO LECTIVO</td>
                <td className="px-5 py-3 text-right text-green-700">${totalIngresos.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-red-700">${totalEgresos.toFixed(2)}</td>
                <td className={"px-5 py-3 text-right text-base " + (totalBalance >= 0 ? 'text-green-700' : 'text-red-700')}>
                  {totalBalance >= 0 ? '+' : ''}${totalBalance.toFixed(2)}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={"px-3 py-1 rounded-full text-xs font-bold " + (totalBalance >= 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800')}>
                    {totalBalance >= 0 ? '✓ Superávit' : '⚠ Déficit'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
