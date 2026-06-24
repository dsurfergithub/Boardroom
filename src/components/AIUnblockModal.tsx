import { useEffect, useState } from 'react';
import { Tarjeta } from '../types';
import { Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { getAuthHeaders, handleAuthError } from '../lib/auth';

interface AIUnblockModalProps {
  tarjeta: Tarjeta;
  onClose: () => void;
}

export function AIUnblockModal({ tarjeta, onClose }: AIUnblockModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            tipo: 'unblock',
            titulo: tarjeta.titulo,
            motivoBloqueo: tarjeta.motivoBloqueo || '',
          }),
        });
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error con la IA');
        setSugerencias(data.sugerencias || []);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [tarjeta]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A] flex items-center gap-2 shrink-0">
          <Lightbulb className="text-[#FFD60A]" />
          <h2 className="text-lg font-bold text-white">Sugerencias para desbloquear</h2>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-sm text-[#8E8E93] mb-3">
            <span className="font-bold text-white">{tarjeta.titulo}</span>
          </p>
          {tarjeta.motivoBloqueo && (
            <p className="text-xs text-[#FFD60A] mb-4">Motivo: {tarjeta.motivoBloqueo}</p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-[#FF453A11] text-[#FF453A] rounded-xl flex items-start gap-2 text-sm border border-[#FF453A33]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#0A84FF]">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm font-bold">Buscando soluciones...</p>
            </div>
          )}

          {!loading && sugerencias.length > 0 && (
            <ul className="flex flex-col gap-3">
              {sugerencias.map((s, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-[#2C2C2E] border border-[#38383A] rounded-xl text-sm text-[#F2F2F7] flex items-start gap-2"
                >
                  <span className="text-[#FFD60A] font-bold shrink-0">{idx + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-[#38383A] flex justify-end gap-2 shrink-0 bg-[#1C1C1E]">
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
