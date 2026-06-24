import { useEffect, useState } from 'react';
import { useBoardroom } from '../context';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { getAuthHeaders, handleAuthError } from '../lib/auth';
import { Tarjeta } from '../types';

interface AISprintPlannerModalProps {
  tableroId: string;
  sprintId: string;
  onClose: () => void;
}

interface PlanItem {
  id: string;
  razon: string;
}

export function AISprintPlannerModal({ tableroId, sprintId, onClose }: AISprintPlannerModalProps) {
  const { state } = useBoardroom();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const columnas = state.columnas.filter(c => c.tableroId === tableroId);
  const backlogCol = columnas.find(c => c.nombre.toLowerCase() === 'sprint');
  const backlog = state.tarjetas.filter(
    t => t.tableroId === tableroId && t.sprintId === sprintId && !t.parentId &&
      (!backlogCol || t.columnaId === backlogCol.id),
  );

  const tarjetaById = (id: string): Tarjeta | undefined => backlog.find(t => t.id === id);

  useEffect(() => {
    const run = async () => {
      try {
        const sprintData = {
          tareas: backlog.map(t => ({
            id: t.id,
            titulo: t.titulo,
            descripcion: t.descripcion,
            prioridad: t.prioridad,
            esfuerzo: t.esfuerzo,
          })),
        };

        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ tipo: 'sprintplan', sprintData }),
        });
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error con la IA');
        setPlan(data.plan || []);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [tableroId, sprintId]);

  const visiblePlan = plan.filter(p => !dismissed.has(p.id) && tarjetaById(p.id));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A] flex items-center gap-2 shrink-0">
          <Sparkles className="text-[#BF5AF2]" />
          <h2 className="text-lg font-bold text-white">Planificador de Sprint (IA)</h2>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-[#FF453A11] text-[#FF453A] rounded-xl flex items-start gap-2 text-sm border border-[#FF453A33]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#BF5AF2]">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold">Analizando el backlog...</p>
            </div>
          )}

          {!loading && !error && visiblePlan.length === 0 && (
            <p className="text-center text-[#8E8E93] py-8 text-sm font-medium">
              No hay sugerencias para mostrar.
            </p>
          )}

          {!loading && visiblePlan.length > 0 && (
            <>
              <p className="text-sm font-bold text-[#8E8E93] uppercase tracking-wider mb-3">
                Orden sugerido:
              </p>
              <div className="flex flex-col gap-3">
                {visiblePlan.map((item, idx) => {
                  const t = tarjetaById(item.id)!;
                  return (
                    <div key={item.id} className="p-4 border border-[#38383A] rounded-xl bg-[#2C2C2E] flex items-start gap-3">
                      <span className="text-[#BF5AF2] font-black text-lg shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white">{t.titulo}</p>
                        <p className="text-xs text-[#8E8E93] mt-1">{item.razon}</p>
                        <div className="flex gap-2 mt-2">
                          {t.esfuerzo && (
                            <span className="px-2 py-0.5 bg-[#1C1C1E] border border-[#38383A] rounded text-[10px] font-bold text-[#8E8E93] uppercase">
                              {t.esfuerzo}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-[#1C1C1E] border border-[#38383A] rounded text-[10px] font-bold text-[#8E8E93] uppercase">
                            {t.prioridad}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setDismissed(prev => new Set(prev).add(item.id))}
                        className="text-xs text-[#8E8E93] hover:text-[#FF453A] font-semibold shrink-0"
                      >
                        Descartar
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-[#38383A] flex justify-end shrink-0 bg-[#1C1C1E]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0A84FF] text-white rounded-xl text-sm font-semibold hover:bg-[#007AFF] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
