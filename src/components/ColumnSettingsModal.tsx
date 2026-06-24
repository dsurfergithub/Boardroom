import { useState } from 'react';
import { Columna as ColumnaType, AppState } from '../types';
import { useBoardroom } from '../context';

interface ColumnSettingsModalProps {
  columna: ColumnaType;
  onClose: () => void;
}

export function ColumnSettingsModal({ columna, onClose }: ColumnSettingsModalProps) {
  const { updateState } = useBoardroom();
  const [nombre, setNombre] = useState(columna.nombre);
  const [wipLimit, setWipLimit] = useState(columna.wipLimit?.toString() || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    if (!nombre.trim()) return;
    const parsed = parseInt(wipLimit, 10);
    updateState((prev: AppState) => ({
      ...prev,
      columnas: prev.columnas.map(c =>
        c.id === columna.id
          ? { ...c, nombre: nombre.trim(), wipLimit: isNaN(parsed) || parsed <= 0 ? undefined : parsed }
          : c
      ),
    }));
    onClose();
  };

  const handleDelete = () => {
    updateState((prev: AppState) => ({
      ...prev,
      columnas: prev.columnas.filter(c => c.id !== columna.id),
      tarjetas: prev.tarjetas.filter(t => t.columnaId !== columna.id),
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A]">
          <h2 className="text-lg font-bold text-white">Ajustes de columna</h2>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#8E8E93] mb-1">Nombre</label>
            <input
              autoFocus
              className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#8E8E93] mb-1">Límite WIP (opcional)</label>
            <input
              type="number"
              min={1}
              className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
              value={wipLimit}
              onChange={e => setWipLimit(e.target.value)}
              placeholder="Sin límite"
            />
          </div>

          {confirmDelete ? (
            <div className="p-3 bg-[#FF453A11] border border-[#FF453A33] rounded-xl">
              <p className="text-sm text-[#FF453A] font-semibold mb-2">
                ¿Eliminar columna y todas sus tareas?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 bg-[#FF453A] text-white rounded-lg text-sm font-bold hover:bg-[#FF3B30] transition-colors"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 px-3 py-2 text-[#8E8E93] hover:text-white bg-[#2C2C2E] rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-[#FF453A] font-semibold hover:underline self-start"
            >
              Eliminar columna
            </button>
          )}
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
            disabled={!nombre.trim()}
            className="px-4 py-2 bg-[#0A84FF] text-white rounded-xl text-sm font-semibold hover:bg-[#007AFF] shadow-lg shadow-[#0A84FF33] transition-colors disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
