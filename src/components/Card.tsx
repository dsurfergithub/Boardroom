import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tarjeta, AppState } from '../types';
import { cn, formatShort, daysUntil } from '../utils';
import { GripVertical, AlertCircle, Wand2, Edit3, Trash2, Plus, Lightbulb, Calendar } from 'lucide-react';
import { useState } from 'react';
import { AISplitModal } from './AISplitModal';
import { useBoardroom } from '../context';
import { EditCardModal } from './EditCardModal';
import { AddCardModal } from './AddCardModal';
import { AIUnblockModal } from './AIUnblockModal';

interface CardProps {
  key?: string | number;
  tarjeta: Tarjeta;
  allCards: Tarjeta[];
  isOverlay?: boolean;
  isSubtask?: boolean;
  compacto?: boolean;
}

export function Card({ tarjeta, allCards, isOverlay, isSubtask = false, compacto = false }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tarjeta.id });
  const { updateState } = useBoardroom();

  const [showAIModal, setShowAIModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const subtasks = allCards.filter(t => t.parentId === tarjeta.id).sort((a, b) => a.orden - b.orden);

  const handleDelete = () => {
    if (confirm('¿Eliminar esta tarea y sus subtareas?')) {
      updateState((prev: AppState) => ({
        ...prev,
        tarjetas: prev.tarjetas.filter(t => t.id !== tarjeta.id && t.parentId !== tarjeta.id)
      }));
    }
  };

  const prioridadColor = {
    baja: 'bg-[#3A3A3C] text-[#32D74B]',
    media: 'bg-[#3A3A3C] text-[#FFD60A]',
    alta: 'bg-[#3A3A3C] text-[#FF453A]'
  };

  const renderDueDate = () => {
    if (!tarjeta.fechaVencimiento) return null;
    const dias = daysUntil(tarjeta.fechaVencimiento);
    const vencida = dias < 0;
    const color = vencida ? '#FF453A' : dias <= 2 ? '#FF9F0A' : '#8E8E93';
    return (
      <div className="flex items-center gap-1 text-[11px] font-semibold mt-1" style={{ color }}>
        <Calendar size={11} />
        <span>
          {vencida ? 'Venció' : 'Vence'} {formatShort(tarjeta.fechaVencimiento)}
        </span>
      </div>
    );
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex flex-col border rounded-xl shadow-sm group",
          isSubtask ? "bg-[#1C1C1E] border-[#38383A]" : "bg-[#2C2C2E] border-[#38383A]",
          isDragging ? "opacity-50" : "opacity-100",
          isOverlay && "shadow-xl rotate-2",
          isSubtask && "ml-4 border-l-2 border-[#38383A] mt-2"
        )}
      >
        <div className={cn("flex items-start gap-2", compacto ? "p-2" : "p-3")}>
          <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-[#48484A] hover:text-[#8E8E93] touch-none">
            <GripVertical size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <div className={cn("flex justify-between items-start", compacto ? "mb-1" : "mb-2")}>
              <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded uppercase", prioridadColor[tarjeta.prioridad])}>
                {tarjeta.prioridad}
              </span>
              {tarjeta.esfuerzo && (
                <span className="text-[10px] font-bold text-[#8E8E93]">
                  {tarjeta.esfuerzo}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm text-white leading-tight mb-1">{tarjeta.titulo}</h3>

            {!compacto && tarjeta.descripcion && (
              <p className="text-xs text-[#8E8E93] leading-snug mt-1 whitespace-pre-wrap break-words">{tarjeta.descripcion}</p>
            )}

            {renderDueDate()}

            {!compacto && tarjeta.motivoBloqueo && (
              <div className="mt-2 p-2 bg-[#FF453A11] rounded-lg border border-[#FF453A33]">
                <p className="text-[10px] text-[#FF453A] font-bold uppercase mb-0.5 flex items-center gap-1">
                  <AlertCircle size={12} /> Motivo:
                </p>
                <p className="text-[11px] text-[#FFD60A]">{tarjeta.motivoBloqueo}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#38383A] px-2 py-1.5 flex items-center justify-end gap-1 bg-[#1C1C1E] rounded-b-xl opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {!isSubtask && (
            <button onClick={() => setShowSubtaskModal(true)} className="p-1.5 text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] rounded flex items-center gap-1 text-xs font-bold" title="Añadir subtarea">
              <Plus size={14} />
              <span className="hidden sm:inline">Subtarea</span>
            </button>
          )}
          {tarjeta.motivoBloqueo && (
            <button onClick={() => setShowUnblockModal(true)} className="p-1.5 text-[#FFD60A] hover:bg-[#2C2C2E] rounded flex items-center gap-1 text-xs font-bold" title="Sugerir solución con IA">
              <Lightbulb size={14} />
              <span className="hidden sm:inline">Sugerir</span>
            </button>
          )}
          {!isSubtask && (
            <button onClick={() => setShowAIModal(true)} className="p-1.5 text-[#0A84FF] hover:bg-[#2C2C2E] rounded flex items-center gap-1 text-xs font-bold" title="Dividir con IA">
              <Wand2 size={14} />
              <span className="hidden sm:inline">IA</span>
            </button>
          )}
          <button onClick={() => setShowEditModal(true)} className="p-1.5 text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] rounded" title="Editar">
            <Edit3 size={14} />
          </button>
          <button onClick={handleDelete} className="p-1.5 text-[#FF453A] hover:bg-[#FF453A33] rounded" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {!compacto && subtasks.length > 0 && !isOverlay && !isDragging && (
        <div className="flex flex-col">
          {subtasks.map(sub => (
            <Card key={sub.id} tarjeta={sub} allCards={allCards} isSubtask={true} compacto={compacto} />
          ))}
        </div>
      )}

      {showAIModal && (
        <AISplitModal tarjeta={tarjeta} onClose={() => setShowAIModal(false)} />
      )}

      {showEditModal && (
        <EditCardModal tarjeta={tarjeta} onClose={() => setShowEditModal(false)} />
      )}

      {showSubtaskModal && (
        <AddCardModal
          columnaId={tarjeta.columnaId}
          tableroId={tarjeta.tableroId}
          sprintId={tarjeta.sprintId}
          parentId={tarjeta.id}
          onClose={() => setShowSubtaskModal(false)}
        />
      )}

      {showUnblockModal && (
        <AIUnblockModal tarjeta={tarjeta} onClose={() => setShowUnblockModal(false)} />
      )}
    </>
  );
}
