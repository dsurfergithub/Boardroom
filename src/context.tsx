import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AppState, Tablero, Sprint, Columna, Tarjeta } from "./types";
import { loadState, saveState, createEmptyState } from "./store";

interface BoardroomContextType {
  state: AppState;
  updateState: (newState: AppState | ((prev: AppState) => AppState)) => void;
  exportState: () => void;
  importState: (jsonString: string) => void;
  resetState: () => void;
}

const BoardroomContext = createContext<BoardroomContextType | null>(null);

export function BoardroomProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  // Sync state to local storage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = (
    newStateOrUpdater: AppState | ((prev: AppState) => AppState),
  ) => {
    setState(newStateOrUpdater);
  };

  const exportState = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "boardroom_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importState = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      // Basic validation could go here
      if (parsed && parsed.tableros && parsed.columnas && parsed.tarjetas) {
        setState(parsed);
      } else {
        alert("El archivo no tiene el formato correcto de Boardroom.");
      }
    } catch (e) {
      alert("Error al procesar el archivo JSON.");
    }
  };

  const resetState = () => {
    updateState(createEmptyState());
  };

  return (
    <BoardroomContext.Provider
      value={{ state, updateState, exportState, importState, resetState }}
    >
      {children}
    </BoardroomContext.Provider>
  );
}

export function useBoardroom() {
  const context = useContext(BoardroomContext);
  if (!context) {
    throw new Error("useBoardroom debe ser usado dentro de BoardroomProvider");
  }
  return context;
}
