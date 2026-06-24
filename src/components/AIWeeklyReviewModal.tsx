import { useEffect, useState } from 'react';
import { useBoardroom } from '../context';
import { Loader2, AlertCircle, FileText } from 'lucide-react';
import { getAuthHeaders, handleAuthError } from '../lib/auth';

interface AIWeeklyReviewModalProps {
  tableroId: string;
  sprintId: string;
  onClose: () => void;
}

interface Review {
  completadas: string;
  enCurso: string;
  bloqueadas: string;
  recomendaciones: string[];
}

export function AIWeeklyReviewModal({ tableroId, sprintId, onClose }: AIWeeklyReviewModalProps) {
  const { state } = useBoardroom();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const columnas = state.columnas.filter(c => c.tableroId === tableroId);
        const tarjetas = state.tarjetas.filter(t => t.tableroId === tableroId && t.sprintId === sprintId);
        const colName = (id: string) => columnas.find(c => c.id === id)?.nombre || '';

        const sprintData = {
          tareas: tarjetas.map(t => ({
            titulo: t.titulo,
            columna: colName(t.columnaId),
            prioridad: t.prioridad,
            esfuerzo: t.esfuerzo,
            motivoBloqueo: t.motivoBloqueo,
          })),
        };

        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ tipo: 'weeklyreview', sprintData }),
        });
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error con la IA');
        setReview(data);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [tableroId, sprintId]);

  const section = (icon: string, titulo: string, contenido: string) => (
    <div className="p-3 bg-[#2C2C2E] border border-[#38383A] rounded-xl">
      <h3 className="text-sm font-bold text-white mb-1">{icon} {titulo}</h3>
      <p className="text-sm text-[#8E8E93] whitespace-pre-wrap">{contenido || 'Nada que reportar.'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A] flex items-center gap-2 shrink-0">
          <FileText className="text-[#0A84FF]" />
          <h2 className="text-lg font-bold text-white">Resumen del Sprint (IA)</h2>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {error && (
            <div className="p-3 bg-[#FF453A11] text-[#FF453A] rounded-xl flex items-start gap-2 text-sm border border-[#FF453A33]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#0A84FF]">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold">Generando resumen del sprint...</p>
            </div>
          )}

          {review && !loading && (
            <>
              {section('✅', 'Completado', review.completadas)}
              {section('🔄', 'En curso', review.enCurso)}
              {section('🚫', 'Bloqueado', review.bloqueadas)}
              <div className="p-3 bg-[#2C2C2E] border border-[#38383A] rounded-xl">
                <h3 className="text-sm font-bold text-white mb-2">📋 Recomendaciones</h3>
                <ul className="flex flex-col gap-1.5">
                  {(review.recomendaciones || []).map((r, idx) => (
                    <li key={idx} className="text-sm text-[#8E8E93] flex items-start gap-2">
                      <span className="text-[#0A84FF] font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
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
