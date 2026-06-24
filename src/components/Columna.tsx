import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Columna as ColumnaType, Tarjeta, AppState } from "../types";
import { Card } from "./Card";
import { Plus } from "lucide-react";
import { useBoardroom } from "../context";
import { cn } from "../utils";
import { AddCardModal } from "./AddCardModal";

interface ColumnaProps {
  key?: string | number;
  columna: ColumnaType;
  tarjetas: Tarjeta[];
  todasLasTarjetas: Tarjeta[];
  sprintId: string;
  tableroId: string;
}

export function Columna({
  columna,
  tarjetas,
  todasLasTarjetas,
  sprintId,
  tableroId,
}: ColumnaProps) {
  const { setNodeRef } = useDroppable({ id: columna.id });

  // count includes subtasks that are in this column
  const count = todasLasTarjetas.filter(
    (t) => t.columnaId === columna.id,
  ).length;
  const isOverLimit = columna.wipLimit ? count > columna.wipLimit : false;

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddCard = () => {
    setShowAddModal(true);
  };

  return (
    <>
      <div className="flex flex-col w-80 min-w-[240px] max-w-[85vw] h-full shrink-0 bg-[#1C1C1E] rounded-2xl border border-[#38383A]">
        <div className="p-4 flex items-center justify-between border-b border-[#38383A] shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  columna.nombre.toLowerCase() === "en curso"
                    ? "bg-[#0A84FF]"
                    : columna.nombre.toLowerCase() === "bloqueado"
                      ? "bg-[#FF453A]"
                      : columna.nombre.toLowerCase() === "fin"
                        ? "bg-[#32D74B]"
                        : "bg-[#8E8E93]",
                )}
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
          <button
            onClick={handleAddCard}
            className="p-1 hover:text-white rounded text-[#8E8E93] transition-colors"
          >
            <Plus size={16} />
          </button>
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
    </>
  );
}
