import { useState } from 'react';
import { Tarjeta, AppState, Esfuerzo, Prioridad } from '../types';
import { useBoardroom } from '../context';

interface EditCardModalProps {
  tarjeta: Tarjeta;
  onClose: () => void;
}

export function EditCardModal({ tarjeta, onClose }: EditCardModalProps) {
  const { updateState } = useBoardroom();
  
  const [titulo, setTitulo] = useState(tarjeta.titulo);
  const [descripcion, setDescripcion] = useState(tarjeta.descripcion);
  const [esfuerzo, setEsfuerzo] = useState<Esfuerzo | ''>(tarjeta.esfuerzo || '');
  const [prioridad, setPrioridad] = useState<Prioridad>(tarjeta.prioridad);

  const handleSave = () => {
    if (!titulo.trim()) return;

    updateState((prev: AppState) => {
      const newTarjetas = prev.tarjetas.map(t => {
        if (t.id === tarjeta.id) {
          return { 
            ...t, 
            titulo: titulo.trim(), 
            descripcion: descripcion.trim(), 
            esfuerzo: esfuerzo ? (esfuerzo as Esfuerzo) : undefined, 
            prioridad 
          };
        }
        return t;
      });
      return { ...prev, tarjetas: newTarjetas };
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A]">
          <h2 className="text-lg font-bold text-white">Editar Tarea</h2>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#8E8E93] mb-1">Título</label>
            <input 
              autoFocus
              className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#8E8E93] mb-1">Descripción</label>
            <textarea 
              className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none resize-none min-h-[80px]"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#8E8E93] mb-1">Esfuerzo</label>
              <select 
                className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
                value={esfuerzo}
                onChange={e => setEsfuerzo(e.target.value as Esfuerzo)}
              >
                <option value="">Ninguno</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#8E8E93] mb-1">Prioridad</label>
              <select 
                className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
                value={prioridad}
                onChange={e => setPrioridad(e.target.value as Prioridad)}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#38383A] flex justify-end gap-2 bg-[#1C1C1E]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] rounded-xl text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={!titulo.trim()}
            className="px-4 py-2 bg-[#0A84FF] text-white rounded-xl text-sm font-semibold hover:bg-[#007AFF] shadow-lg shadow-[#0A84FF33] transition-colors disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
