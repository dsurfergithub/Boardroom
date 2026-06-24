import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface MotivoBloqueoModalProps {
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

export function MotivoBloqueoModal({ onConfirm, onCancel }: MotivoBloqueoModalProps) {
  const [motivo, setMotivo] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><AlertCircle size={18} className="text-[#FF453A]"/> Motivo de Bloqueo</h2>
        </div>
        
        <div className="p-4">
          <label className="block text-sm font-semibold text-[#8E8E93] mb-2">
            Por favor, indica por qué esta tarea está bloqueada:
          </label>
          <textarea 
            autoFocus
            className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#FF453A] outline-none resize-none min-h-[80px]"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: Esperando respuesta del cliente..."
          />
        </div>

        <div className="p-4 border-t border-[#38383A] flex justify-end gap-2 bg-[#1C1C1E]">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] rounded-xl text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(motivo)}
            disabled={!motivo.trim()}
            className="px-4 py-2 bg-[#FF453A] text-white rounded-xl text-sm font-semibold hover:bg-[#FF3B30] shadow-lg shadow-[#FF453A33] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bloquear Tarea
          </button>
        </div>
      </div>
    </div>
  );
}
