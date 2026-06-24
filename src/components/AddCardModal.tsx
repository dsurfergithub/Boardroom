import { useState } from "react";
import { Tarjeta, AppState, Esfuerzo, Prioridad } from "../types";
import { useBoardroom } from "../context";
import { dateInputToTimestamp } from "../utils";
import { getAuthHeaders, handleAuthError } from "../lib/auth";
import { Sparkles, Loader2 } from "lucide-react";

interface AddCardModalProps {
  columnaId: string;
  tableroId: string;
  sprintId: string;
  parentId?: string | null;
  onClose: () => void;
}

export function AddCardModal({
  columnaId,
  tableroId,
  sprintId,
  parentId = null,
  onClose,
}: AddCardModalProps) {
  const { updateState } = useBoardroom();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [esfuerzo, setEsfuerzo] = useState<Esfuerzo | "">("");
  const [prioridad, setPrioridad] = useState<Prioridad>("media");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleSuggest = async () => {
    if (!titulo.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ tipo: "autodesc", titulo: titulo.trim() }),
      });
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error con la IA");
      if (data.descripcion) setDescripcion(data.descripcion);
      if (data.esfuerzo) setEsfuerzo(data.esfuerzo as Esfuerzo);
      if (data.prioridad) setPrioridad(data.prioridad as Prioridad);
    } catch (err: any) {
      setAiError(err.message || "Ocurrió un error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!titulo.trim()) return;

    const newTask: Tarjeta = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tableroId,
      sprintId,
      columnaId,
      esfuerzo: esfuerzo ? (esfuerzo as Esfuerzo) : undefined,
      prioridad,
      orden: Date.now(),
      parentId,
      createdAt: Date.now(),
      fechaVencimiento: dateInputToTimestamp(fechaVencimiento),
    };

    updateState((prev: AppState) => ({
      ...prev,
      tarjetas: [...prev.tarjetas, newTask],
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#38383A]">
        <div className="p-4 border-b border-[#38383A]">
          <h2 className="text-lg font-bold text-white">
            {parentId ? "Nueva Subtarea" : "Nueva Tarea"}
          </h2>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#8E8E93] mb-1">
              Título
            </label>
            <input
              autoFocus
              className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="¿Qué hay que hacer?"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-[#8E8E93]">
                Descripción
              </label>
              <button
                onClick={handleSuggest}
                disabled={!titulo.trim() || aiLoading}
                className="flex items-center gap-1 text-xs font-bold text-[#0A84FF] hover:text-[#007AFF] disabled:opacity-40 transition-colors"
                title="Sugerir con IA"
              >
                {aiLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Sugerir con IA
              </button>
            </div>
            <textarea
              className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none resize-none min-h-[80px]"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles adicionales..."
            />
            {aiError && (
              <p className="text-xs text-[#FF453A] mt-1 font-medium">{aiError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#8E8E93] mb-1">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#8E8E93] mb-1">
                Esfuerzo
              </label>
              <select
                className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
                value={esfuerzo}
                onChange={(e) => setEsfuerzo(e.target.value as Esfuerzo)}
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
              <label className="block text-sm font-semibold text-[#8E8E93] mb-1">
                Prioridad
              </label>
              <select
                className="w-full bg-[#2C2C2E] border border-[#38383A] text-white rounded-xl p-3 text-base sm:text-sm focus:ring-2 focus:ring-[#0A84FF] outline-none"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as Prioridad)}
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
            Guardar Tarea
          </button>
        </div>
      </div>
    </div>
  );
}
