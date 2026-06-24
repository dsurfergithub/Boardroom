import React, { useRef, useState } from "react";
import { useBoardroom } from "../context";
import {
  Download,
  Upload,
  Columns,
  Kanban,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../utils";
import { AppState, Tarjeta } from "../types";
import { PromptModal } from "./PromptModal";
import { ConfirmModal } from "./ConfirmModal";

interface HeaderProps {
  activeTableroId: string;
  setActiveTableroId: (id: string) => void;
  activeSprintId: string;
  setActiveSprintId: (id: string) => void;
  viewMode: "global" | "tabs";
  setViewMode: (mode: "global" | "tabs") => void;
}

export function Header({
  activeTableroId,
  setActiveTableroId,
  activeSprintId,
  setActiveSprintId,
  viewMode,
  setViewMode,
}: HeaderProps) {
  const { state, exportState, importState, resetState, updateState } =
    useBoardroom();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [promptConfig, setPromptConfig] = useState<{type: 'tablero' | 'sprint' | 'close_sprint', title: string} | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{title: string, onConfirm: () => void, confirmText: string, confirmColor?: string, onCancel?: () => void, cancelText?: string} | null>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        importState(e.target.result as string);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeAddTablero = (nombre: string) => {
    const tId = crypto.randomUUID();
    const sId = crypto.randomUUID();
    updateState((prev: AppState) => ({
      ...prev,
      tableros: [
        ...prev.tableros,
        { id: tId, nombre, activo: true, createdAt: Date.now() },
      ],
      sprints: [
        ...prev.sprints,
        {
          id: sId,
          tableroId: tId,
          nombre: "Sprint 1",
          activo: true,
          fechaInicio: Date.now(),
          fechaFin: Date.now() + 7 * 24 * 60 * 60 * 1000,
          archivado: false,
        },
      ],
      columnas: [
        ...prev.columnas,
        {
          id: crypto.randomUUID(),
          tableroId: tId,
          nombre: "Sprint",
          orden: 0,
          wipLimit: 10,
        },
        {
          id: crypto.randomUUID(),
          tableroId: tId,
          nombre: "En curso",
          orden: 1,
          wipLimit: 3,
        },
        {
          id: crypto.randomUUID(),
          tableroId: tId,
          nombre: "Bloqueado",
          orden: 2,
        },
        { id: crypto.randomUUID(), tableroId: tId, nombre: "Fin", orden: 3 },
      ],
    }));
    setActiveTableroId(tId);
    setActiveSprintId(sId);
  };

  const executeAddSprint = (nombre: string) => {
    if (!activeTableroId) return;
    const sId = crypto.randomUUID();
    updateState((prev: AppState) => ({
      ...prev,
      sprints: [
        ...prev.sprints,
        {
          id: sId,
          tableroId: activeTableroId,
          nombre,
          activo: true,
          fechaInicio: Date.now(),
          fechaFin: Date.now() + 7 * 24 * 60 * 60 * 1000,
          archivado: false,
        },
      ],
    }));
    setActiveSprintId(sId);
  };

  const executeCloseSprint = (newSprintName: string) => {
    if (!activeSprintId || !activeTableroId) return;
    const sId = crypto.randomUUID();
    
    updateState((prev: AppState) => {
      // Find "Fin" column for this board
      const finCol = prev.columnas.find(c => c.tableroId === activeTableroId && c.nombre.toLowerCase() === 'fin');
      
      const newSprints = prev.sprints.map(s => s.id === activeSprintId ? { ...s, archivado: true } : s);
      newSprints.push({
        id: sId,
        tableroId: activeTableroId,
        nombre: newSprintName,
        activo: true,
        fechaInicio: Date.now(),
        fechaFin: Date.now() + 7 * 24 * 60 * 60 * 1000,
        archivado: false,
      });
      
      // Move unfinished tasks
      const newTarjetas = prev.tarjetas.map(t => {
        if (t.sprintId === activeSprintId) {
          if (finCol && t.columnaId !== finCol.id) {
            return { ...t, sprintId: sId };
          }
        }
        return t;
      });
      
      return {
        ...prev,
        sprints: newSprints,
        tarjetas: newTarjetas
      };
    });
    
    setActiveSprintId(sId);
  };

  const handlePromptConfirm = (value: string) => {
    if (promptConfig?.type === 'tablero') executeAddTablero(value);
    else if (promptConfig?.type === 'sprint') executeAddSprint(value);
    else if (promptConfig?.type === 'close_sprint') executeCloseSprint(value);
    setPromptConfig(null);
  };

  const handleResetRequest = () => {
    setConfirmConfig({
      title: "¿Estás seguro de que quieres borrar todos los datos?",
      confirmText: "Borrar todo",
      confirmColor: "bg-[#FF453A] hover:bg-[#FF3B30] shadow-[#FF453A33]",
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        resetState();
        setConfirmConfig(null);
      }
    });
  };

  const handleCloseSprint = () => {
    if (!activeSprintId) return;
    
    setConfirmConfig({
      title: "¿Cerrar y archivar el sprint actual?",
      confirmText: "Cerrar Sprint",
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        // Ask if want to move to new sprint
        setConfirmConfig({
          title: "¿Mover las tareas no terminadas a un nuevo sprint?",
          confirmText: "Sí, mover",
          cancelText: "No, solo archivar",
          onCancel: () => {
            updateState((prev: AppState) => ({
              ...prev,
              sprints: prev.sprints.map(s => s.id === activeSprintId ? { ...s, archivado: true } : s)
            }));
            setConfirmConfig(null);
          },
          onConfirm: () => {
            setConfirmConfig(null);
            setPromptConfig({ type: 'close_sprint', title: 'Nombre del nuevo sprint:' });
          }
        });
      }
    });
  };

  const sprintsTablero = state.sprints.filter(
    (s) => s.tableroId === activeTableroId,
  );

  return (
    <>
      <header className="flex flex-col gap-2 p-3 bg-[#1C1C1E]/80 backdrop-blur-md border-b border-[#38383A] shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Boardroom
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#8E8E93] hover:text-white rounded-full transition-colors"
              title="Importar"
            >
              <Upload size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={exportState}
              className="p-2 text-[#8E8E93] hover:text-white rounded-full transition-colors"
              title="Exportar"
            >
              <Download size={18} />
            </button>

            <button
              onClick={handleResetRequest}
              className="p-2 text-[#FF453A] hover:bg-[#FF453A33] rounded-full transition-colors ml-1"
              title="Reiniciar App"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="flex flex-1 items-center gap-1">
              <select
                value={activeTableroId}
                onChange={(e) => setActiveTableroId(e.target.value)}
                className="flex-1 bg-[#2C2C2E] border border-[#38383A] text-white text-base sm:text-sm rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-[#0A84FF] outline-none truncate"
              >
                {state.tableros.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPromptConfig({ type: 'tablero', title: 'Nombre del nuevo tablero:' })}
                className="p-2 bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl hover:bg-[#3A3A3C] transition-colors"
                title="Nuevo Tablero"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-1 items-center gap-1">
              <select
                value={activeSprintId}
                onChange={(e) => setActiveSprintId(e.target.value)}
                className="flex-1 bg-[#2C2C2E] border border-[#38383A] text-white text-base sm:text-sm rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-[#0A84FF] outline-none truncate"
              >
                {sprintsTablero.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} {s.archivado ? "(Archivado)" : ""}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPromptConfig({ type: 'sprint', title: 'Nombre del nuevo sprint:' })}
                className="p-2 bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl hover:bg-[#3A3A3C] transition-colors"
                title="Nuevo Sprint"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={handleCloseSprint}
                className="p-2 bg-[#32D74B]/20 text-[#32D74B] border border-[#32D74B]/30 rounded-xl hover:bg-[#32D74B]/30 transition-colors ml-1"
                title="Cerrar Sprint"
              >
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center bg-[#2C2C2E] p-1 rounded-lg">
            <button
              onClick={() => setViewMode("global")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "global"
                  ? "bg-[#636366] shadow-sm text-white"
                  : "text-[#8E8E93] hover:text-white",
              )}
              title="Vista Global"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setViewMode("tabs")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "tabs"
                  ? "bg-[#636366] shadow-sm text-white"
                  : "text-[#8E8E93] hover:text-white",
              )}
              title="Vista por Pestañas"
            >
              <Kanban size={16} />
            </button>
          </div>
        </div>
      </header>

      {promptConfig && (
        <PromptModal
          title={promptConfig.title}
          placeholder="Escribe un nombre..."
          onConfirm={handlePromptConfirm}
          onCancel={() => setPromptConfig(null)}
        />
      )}

      {confirmConfig && (
        <ConfirmModal
          title={confirmConfig.title}
          onConfirm={confirmConfig.onConfirm}
          onCancel={confirmConfig.onCancel || (() => setConfirmConfig(null))}
          confirmText={confirmConfig.confirmText}
          confirmColor={confirmConfig.confirmColor}
          cancelText={confirmConfig.cancelText}
        />
      )}
    </>
  );
}
