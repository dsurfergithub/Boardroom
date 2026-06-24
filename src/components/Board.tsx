import { useState } from 'react';
import { useBoardroom } from '../context';
import { Columna } from './Columna';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Tarjeta, AppState, FiltrosActivos } from '../types';
import { Card } from './Card';
import { MotivoBloqueoModal } from './MotivoBloqueoModal';
import { daysUntil } from '../utils';
import { Plus } from 'lucide-react';

interface BoardProps {
  tableroId: string;
  sprintId: string;
  viewMode: 'global' | 'tabs';
  filtros: FiltrosActivos;
  compacto: boolean;
  readOnly: boolean;
  accentColor: string;
  onAddColumn: () => void;
}

function pasaFiltros(t: Tarjeta, filtros: FiltrosActivos): boolean {
  if (filtros.texto) {
    const q = filtros.texto.toLowerCase();
    if (!t.titulo.toLowerCase().includes(q) && !t.descripcion.toLowerCase().includes(q)) {
      return false;
    }
  }
  if (filtros.prioridades.length > 0 && !filtros.prioridades.includes(t.prioridad)) {
    return false;
  }
  if (filtros.esfuerzos.length > 0 && (!t.esfuerzo || !filtros.esfuerzos.includes(t.esfuerzo))) {
    return false;
  }
  if (filtros.soloVencidas) {
    if (!t.fechaVencimiento || daysUntil(t.fechaVencimiento) >= 0) return false;
  }
  return true;
}

export function Board({ tableroId, sprintId, viewMode, filtros, compacto, readOnly, accentColor, onAddColumn }: BoardProps) {
  const { state, updateState } = useBoardroom();
  const columnas = state.columnas.filter(c => c.tableroId === tableroId).sort((a, b) => a.orden - b.orden);
  const tarjetas = state.tarjetas.filter(t => t.tableroId === tableroId && t.sprintId === sprintId);

  const totalSprint = tarjetas.length;

  const [activeTabId, setActiveTabId] = useState(columnas[0]?.id || '');
  const [activeCard, setActiveCard] = useState<Tarjeta | null>(null);

  const [bloqueoModal, setBloqueoModal] = useState<{ tarjetaId: string, columnaId: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = tarjetas.find(t => t.id === active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || readOnly) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = tarjetas.find(t => t.id === activeId);
    if (!activeCard) return;

    let targetColumnaId = activeCard.columnaId;

    // Determine target column
    const isOverColumn = columnas.some(c => c.id === overId);
    if (isOverColumn) {
      targetColumnaId = overId;
    } else {
      const overCard = tarjetas.find(t => t.id === overId);
      if (overCard) {
        targetColumnaId = overCard.columnaId;
      }
    }

    const targetColumna = columnas.find(c => c.id === targetColumnaId);
    if (!targetColumna) return;

    // Check if moving to 'Bloqueado' column
    if (targetColumna.nombre.toLowerCase() === 'bloqueado' && activeCard.columnaId !== targetColumnaId) {
      setBloqueoModal({ tarjetaId: activeId, columnaId: targetColumnaId });
      return;
    }

    applyMove(activeId, targetColumnaId);
  };

  const applyMove = (tarjetaId: string, targetColumnaId: string, motivo?: string) => {
    updateState((prev: AppState) => {
      const nextTarjetas = prev.tarjetas.map(t => {
        if (t.id === tarjetaId) {
          return { ...t, columnaId: targetColumnaId, motivoBloqueo: motivo || t.motivoBloqueo };
        }
        return t;
      });
      return { ...prev, tarjetas: nextTarjetas };
    });
  };

  const handleBloqueoConfirm = (motivo: string) => {
    if (bloqueoModal) {
      applyMove(bloqueoModal.tarjetaId, bloqueoModal.columnaId, motivo);
    }
    setBloqueoModal(null);
  };

  if (columnas.length === 0) {
    return (
      <div className="p-4 text-center flex flex-col items-center gap-3">
        <p className="text-[#8E8E93]">No hay columnas</p>
        <button
          onClick={onAddColumn}
          className="px-4 py-2 bg-[#0A84FF] text-white rounded-xl text-sm font-semibold hover:bg-[#007AFF] transition-colors"
        >
          Añadir columna
        </button>
      </div>
    );
  }

  const displayedColumns = viewMode === 'global' ? columnas : columnas.filter(c => c.id === (activeTabId || columnas[0].id));

  return (
    <div className="h-full flex flex-col">
      {viewMode === 'tabs' && (
        <div className="flex border-b border-[#38383A] overflow-x-auto bg-[#1C1C1E] shrink-0 scrollbar-hide">
          {columnas.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveTabId(col.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTabId === col.id ? 'text-[#0A84FF] border-b-2 border-[#0A84FF]' : 'text-[#8E8E93] hover:text-white'}`}
            >
              {col.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-black">
        <div className="flex h-full p-4 gap-4 items-start w-max min-w-full">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={columnas.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {displayedColumns.map(col => (
                <Columna
                  key={col.id}
                  columna={col}
                  tarjetas={tarjetas.filter(t => t.columnaId === col.id && !t.parentId && pasaFiltros(t, filtros))}
                  todasLasTarjetas={tarjetas}
                  sprintId={sprintId}
                  tableroId={tableroId}
                  totalSprint={totalSprint}
                  accentColor={accentColor}
                  compacto={compacto}
                  readOnly={readOnly}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeCard ? <Card tarjeta={activeCard} isOverlay={true} allCards={tarjetas} compacto={compacto} /> : null}
            </DragOverlay>
          </DndContext>

          {viewMode === 'global' && (
            <button
              onClick={onAddColumn}
              className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#1C1C1E] border border-dashed border-[#38383A] rounded-2xl text-[#8E8E93] hover:text-white hover:border-[#636366] transition-colors mt-1"
              title="Añadir columna"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {bloqueoModal && (
        <MotivoBloqueoModal
          onConfirm={handleBloqueoConfirm}
          onCancel={() => setBloqueoModal(null)}
        />
      )}
    </div>
  );
}
