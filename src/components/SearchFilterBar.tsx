import { Search, X } from 'lucide-react';
import { FiltrosActivos, Prioridad, Esfuerzo } from '../types';
import { cn } from '../utils';

interface SearchFilterBarProps {
  filtros: FiltrosActivos;
  setFiltros: (f: FiltrosActivos) => void;
}

const PRIORIDADES: Prioridad[] = ['baja', 'media', 'alta'];
const ESFUERZOS: Esfuerzo[] = ['XS', 'S', 'M', 'L', 'XL'];

export function SearchFilterBar({ filtros, setFiltros }: SearchFilterBarProps) {
  const togglePrioridad = (p: Prioridad) => {
    const next = filtros.prioridades.includes(p)
      ? filtros.prioridades.filter(x => x !== p)
      : [...filtros.prioridades, p];
    setFiltros({ ...filtros, prioridades: next });
  };

  const toggleEsfuerzo = (e: Esfuerzo) => {
    const next = filtros.esfuerzos.includes(e)
      ? filtros.esfuerzos.filter(x => x !== e)
      : [...filtros.esfuerzos, e];
    setFiltros({ ...filtros, esfuerzos: next });
  };

  const hayFiltros =
    filtros.texto ||
    filtros.prioridades.length > 0 ||
    filtros.esfuerzos.length > 0 ||
    filtros.soloVencidas;

  const limpiar = () =>
    setFiltros({ texto: '', prioridades: [], esfuerzos: [], soloVencidas: false });

  const chip = (active: boolean) =>
    cn(
      'px-2.5 py-1 rounded-full text-xs font-bold uppercase border transition-colors',
      active
        ? 'bg-[#0A84FF] border-[#0A84FF] text-white'
        : 'bg-[#2C2C2E] border-[#38383A] text-[#8E8E93] hover:text-white',
    );

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-[#1C1C1E] border-b border-[#38383A] shrink-0">
      <div className="relative flex-1 min-w-[160px]">
        <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
        <input
          value={filtros.texto}
          onChange={e => setFiltros({ ...filtros, texto: e.target.value })}
          placeholder="Buscar tareas..."
          className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
        />
      </div>

      <div className="flex items-center gap-1">
        {PRIORIDADES.map(p => (
          <button key={p} onClick={() => togglePrioridad(p)} className={chip(filtros.prioridades.includes(p))}>
            {p}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {ESFUERZOS.map(e => (
          <button key={e} onClick={() => toggleEsfuerzo(e)} className={chip(filtros.esfuerzos.includes(e))}>
            {e}
          </button>
        ))}
      </div>

      <button
        onClick={() => setFiltros({ ...filtros, soloVencidas: !filtros.soloVencidas })}
        className={cn(
          'px-2.5 py-1 rounded-full text-xs font-bold uppercase border transition-colors',
          filtros.soloVencidas
            ? 'bg-[#FF453A] border-[#FF453A] text-white'
            : 'bg-[#2C2C2E] border-[#38383A] text-[#8E8E93] hover:text-white',
        )}
      >
        Vencidas
      </button>

      {hayFiltros && (
        <button
          onClick={limpiar}
          className="flex items-center gap-1 text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors"
        >
          <X size={14} /> Limpiar
        </button>
      )}
    </div>
  );
}
