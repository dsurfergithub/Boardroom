import { useState } from 'react';
import { Tarjeta, AppState } from '../types';
import { useBoardroom } from '../context';
import { Loader2, AlertCircle, Wand2 } from 'lucide-react';

interface AISplitModalProps {
  tarjeta: Tarjeta;
  onClose: () => void;
}

export function AISplitModal({ tarjeta, onClose }: AISplitModalProps) {
  const { state, updateState } = useBoardroom();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposedSubtasks, setProposedSubtasks] = useState<any[]>([]);

  const handleSplit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const activeTablero = state.tableros.find(t => t.id === tarjeta.tableroId);
      const columnas = state.columnas.filter(c => c.tableroId === tarjeta.tableroId);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarea: {
            titulo: tarjeta.titulo,
            descripcion: tarjeta.descripcion,
            esfuerzo: tarjeta.esfuerzo
          },
          contexto: columnas.map(c => `- ID: ${c.id}, Nombre: ${c.nombre}`).join('\n')
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con la IA');
      }

      setProposedSubtasks(data.subtasks);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    updateState((prev: AppState) => {
      const newTarjetas = proposedSubtasks.map((sub, index) => ({
        id: crypto.randomUUID(),
        titulo: sub.titulo,
        descripcion: sub.descripcion || '',
        esfuerzo: sub.esfuerzo || 'S',
        prioridad: sub.prioridad || 'media',
        columnaId: sub.columnaId || tarjeta.columnaId,
        tableroId: tarjeta.tableroId,
        sprintId: tarjeta.sprintId,
        orden: tarjeta.orden + index + 1,
        parentId: tarjeta.id,
        createdAt: Date.now()
      }));

      return {
        ...prev,
        tarjetas: [...prev.tarjetas, ...newTarjetas]
      };
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A] flex items-center gap-2 shrink-0">
          <Wand2 className="text-[#0A84FF]" />
          <h2 className="text-lg font-bold text-white">Dividir Tarea con IA</h2>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-[#FF453A11] text-[#FF453A] rounded-xl flex items-start gap-2 text-sm border border-[#FF453A33]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {proposedSubtasks.length === 0 && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-[#8E8E93] mb-6 text-sm font-medium">
                La IA de Gemini analizará esta tarea y propondrá una serie de subtareas más manejables con estimaciones de esfuerzo y prioridad.
              </p>
              <button 
                onClick={handleSplit}
                className="bg-[#0A84FF] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#007AFF] shadow-lg shadow-[#0A84FF33] transition-colors inline-flex items-center gap-2"
              >
                Generar propuesta
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#0A84FF]">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold">Analizando y dividiendo tarea...</p>
            </div>
          )}

          {proposedSubtasks.length > 0 && !loading && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Propuesta de subtareas:</p>
              {proposedSubtasks.map((sub, idx) => (
                <div key={idx} className="p-4 border border-[#38383A] rounded-xl bg-[#2C2C2E] flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <input 
                      className="font-bold text-base sm:text-sm w-full bg-transparent text-white border-b border-[#38383A] focus:border-[#0A84FF] px-1 py-1 outline-none"
                      value={sub.titulo}
                      onChange={e => {
                        const newSubs = [...proposedSubtasks];
                        newSubs[idx].titulo = e.target.value;
                        setProposedSubtasks(newSubs);
                      }}
                    />
                  </div>
                  {sub.descripcion && <p className="text-sm text-[#8E8E93] px-1">{sub.descripcion}</p>}
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 bg-[#1C1C1E] border border-[#38383A] rounded-md text-[#8E8E93] text-[10px] font-bold uppercase">
                      Esfuerzo: {sub.esfuerzo}
                    </span>
                    <span className="px-2 py-1 bg-[#1C1C1E] border border-[#38383A] rounded-md text-[#8E8E93] text-[10px] font-bold uppercase">
                      Prioridad: {sub.prioridad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#38383A] flex justify-end gap-2 shrink-0 bg-[#1C1C1E]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] rounded-xl text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          {proposedSubtasks.length > 0 && !loading && (
            <button 
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#0A84FF] text-white rounded-xl text-sm font-bold hover:bg-[#007AFF] shadow-lg shadow-[#0A84FF33] transition-colors"
            >
              Aceptar e insertar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
