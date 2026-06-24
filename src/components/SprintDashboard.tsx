import { useBoardroom } from '../context';
import { Esfuerzo, ESFUERZO_PUNTOS } from '../types';
import { X } from 'lucide-react';

interface SprintDashboardProps {
  tableroId: string;
  sprintId: string;
  accentColor: string;
  onClose: () => void;
}

const ESFUERZOS: Esfuerzo[] = ['XS', 'S', 'M', 'L', 'XL'];

export function SprintDashboard({ tableroId, sprintId, accentColor, onClose }: SprintDashboardProps) {
  const { state } = useBoardroom();

  const columnas = state.columnas
    .filter(c => c.tableroId === tableroId)
    .sort((a, b) => a.orden - b.orden);
  const tarjetas = state.tarjetas.filter(t => t.tableroId === tableroId && t.sprintId === sprintId);

  const finCol = columnas.find(c => c.nombre.toLowerCase() === 'fin');
  const enCursoCol = columnas.find(c => c.nombre.toLowerCase() === 'en curso');
  const bloqueadoCol = columnas.find(c => c.nombre.toLowerCase() === 'bloqueado');

  const total = tarjetas.length;
  const completadas = finCol ? tarjetas.filter(t => t.columnaId === finCol.id).length : 0;
  const enCurso = enCursoCol ? tarjetas.filter(t => t.columnaId === enCursoCol.id).length : 0;
  const bloqueadas = bloqueadoCol ? tarjetas.filter(t => t.columnaId === bloqueadoCol.id).length : 0;
  const pctCompletado = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const porEsfuerzo = ESFUERZOS.map(e => ({
    label: e,
    count: tarjetas.filter(t => t.esfuerzo === e).length,
  }));
  const maxEsfuerzo = Math.max(1, ...porEsfuerzo.map(x => x.count));

  const porColumna = columnas.map(c => ({
    label: c.nombre,
    count: tarjetas.filter(t => t.columnaId === c.id).length,
  }));
  const maxColumna = Math.max(1, ...porColumna.map(x => x.count));

  const prioridades = (['alta', 'media', 'baja'] as const).map(p => ({
    label: p,
    count: tarjetas.filter(t => t.prioridad === p).length,
  }));

  // Historical velocity from archived sprints of this board
  const archivados = state.sprints
    .filter(s => s.tableroId === tableroId && s.archivado)
    .sort((a, b) => a.fechaInicio - b.fechaInicio);
  const velocidad = archivados.map(s => {
    const cards = state.tarjetas.filter(
      t => t.tableroId === tableroId && t.sprintId === s.id && finCol && t.columnaId === finCol.id,
    );
    const puntos = cards.reduce((sum, t) => sum + (t.esfuerzo ? ESFUERZO_PUNTOS[t.esfuerzo] : 0), 0);
    return { nombre: s.nombre, completadas: cards.length, puntos };
  });
  const maxPuntos = Math.max(1, ...velocidad.map(v => v.puntos));

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pctCompletado / 100);

  const summaryCard = (label: string, value: number, color: string) => (
    <div className="bg-[#2C2C2E] border border-[#38383A] rounded-2xl p-4 flex flex-col">
      <span className="text-3xl font-black" style={{ color }}>{value}</span>
      <span className="text-xs font-semibold text-[#8E8E93] uppercase mt-1">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
      <div className="min-h-full p-4 sm:p-8">
        <div className="max-w-3xl mx-auto bg-[#1C1C1E] rounded-2xl border border-[#38383A] overflow-hidden">
          <div className="p-4 border-b border-[#38383A] flex items-center justify-between sticky top-0 bg-[#1C1C1E] z-10">
            <h2 className="text-lg font-bold text-white">Dashboard del Sprint</h2>
            <button
              onClick={onClose}
              className="p-2 text-[#8E8E93] hover:text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 sm:p-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {summaryCard('Total', total, '#F2F2F7')}
              {summaryCard('Completadas', completadas, '#32D74B')}
              {summaryCard('En curso', enCurso, accentColor)}
              {summaryCard('Bloqueadas', bloqueadas, '#FF453A')}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center bg-[#2C2C2E] border border-[#38383A] rounded-2xl p-6">
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="#38383A" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#32D74B"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{pctCompletado}%</span>
                  <span className="text-[10px] text-[#8E8E93] uppercase font-bold">Completado</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Prioridades</h3>
                <div className="flex flex-col gap-2">
                  {prioridades.map(p => (
                    <div key={p.label} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-[#8E8E93] font-semibold">{p.label}</span>
                      <span className="text-white font-bold">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#2C2C2E] border border-[#38383A] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Distribución por esfuerzo</h3>
              <div className="flex flex-col gap-2">
                {porEsfuerzo.map(e => (
                  <div key={e.label} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-bold text-[#8E8E93]">{e.label}</span>
                    <div className="flex-1 h-4 bg-[#1C1C1E] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(e.count / maxEsfuerzo) * 100}%`, backgroundColor: accentColor }}
                      ></div>
                    </div>
                    <span className="w-6 text-right text-xs font-bold text-white">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#2C2C2E] border border-[#38383A] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Tareas por columna</h3>
              <div className="flex flex-col gap-2">
                {porColumna.map(c => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-bold text-[#8E8E93] truncate">{c.label}</span>
                    <div className="flex-1 h-4 bg-[#1C1C1E] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(c.count / maxColumna) * 100}%`, backgroundColor: '#0A84FF' }}
                      ></div>
                    </div>
                    <span className="w-6 text-right text-xs font-bold text-white">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#2C2C2E] border border-[#38383A] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Velocidad histórica</h3>
              {velocidad.length === 0 ? (
                <p className="text-sm text-[#8E8E93]">Aún no hay sprints archivados.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {velocidad.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-28 text-xs font-bold text-[#8E8E93] truncate">{v.nombre}</span>
                      <div className="flex-1 h-4 bg-[#1C1C1E] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(v.puntos / maxPuntos) * 100}%`, backgroundColor: '#32D74B' }}
                        ></div>
                      </div>
                      <span className="w-20 text-right text-xs font-bold text-white">
                        {v.completadas} · {v.puntos} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
