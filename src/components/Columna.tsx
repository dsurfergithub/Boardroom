import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Columna as ColumnaType, Tarjeta } from "../types";
import { Card } from "./Card";
import { Plus, Settings2 } from "lucide-react";
import { cn } from "../utils";
import { AddCardModal } from "./AddCardModal";
import { ColumnSettingsModal } from "./ColumnSettingsModal";

interface ColumnaProps {
  key?: string | number;
  columna: ColumnaType;
  tarjetas: Tarjeta[];
  todasLasTarjetas: Tarjeta[];
  sprintId: string;
  tableroId: string;
  totalSprint: number;
  accentColor: string;
  compacto?: boolean;
  readOnly?: boolean;
}

export function Columna({
  columna,
  tarjetas,
  todasLasTarjetas,
  sprintId,
  tableroId,
  totalSprint,
  accentColor,
  compacto = false,
  readOnly = false,
}: ColumnaProps) {
  const { setNodeRef } = useDroppable({ id: columna.id });

  // count includes subtasks that are in this column
  const count = todasLasTarjetas.filter(
    (t) => t.columnaId === columna.id,
  ).length;
  const isOverLimit = columna.wipLimit ? count > columna.wipLimit : false;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const nombre = columna.nombre.toLowerCase();
  const dotColor =
    nombre === "en curso"
      ? accentColor
      : nombre === "bloqueado"
        ? "#FF453A"
        : nombre === "fin"
          ? "#32D74B"
          : "#8E8E93";

  const pct = totalSprint > 0 ? Math.round((count / totalSprint) * 100) : 0;

  return (
    <>
      <div className="flex flex-col w-80 min-w-[240px] max-w-[85vw] h-full shrink-0 bg-[#1C1C1E] rounded-2xl border border-[#38383A]">
        <div className="p-4 pb-3 border-b border-[#38383A] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dotColor }}
                ></span>
                {columna.nombre}
              </h2>
              <span
                className={cn(
                  "text-xs font-mono px-2 py-0.5 rounded-full bg-[#2C2C2E]",
                  isOverLimit ? "text-[#FF453A]" : "text-[#8E8E93]",
                )}
              >
                {count} {columna.wipLimit ? `/ ${columna.wipLimit}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(true)}
                className="p-1 hover:text-white rounded text-[#8E8E93] transition-colors"
                title="Ajustes de columna"
              >
                <Settings2 size={16} />
              </button>
              {!readOnly && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-1 hover:text-white rounded text-[#8E8E93] transition-colors"
                  title="Añadir tarea"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 h-1 w-full bg-[#2C2C2E] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: dotColor }}
            ></div>
          </div>
        </div>

        <div
          ref={setNodeRef}
          className="flex-1 p-3 overflow-y-auto min-h-[100px] flex flex-col gap-3 pb-20"
        >
          <SortableContext
            items={tarjetas.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tarjetas
              .sort((a, b) => a.orden - b.orden)
              .map((tarjeta) => (
                <Card
                  key={tarjeta.id}
                  tarjeta={tarjeta}
                  allCards={todasLasTarjetas}
                  compacto={compacto}
                />
              ))}
          </SortableContext>
        </div>
      </div>

      {showAddModal && (
        <AddCardModal
          columnaId={columna.id}
          tableroId={tableroId}
          sprintId={sprintId}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showSettings && (
        <ColumnSettingsModal columna={columna} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
