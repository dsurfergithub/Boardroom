import { AppState, Tablero, Sprint, Columna, Tarjeta } from "./types";

const INITIAL_STATE: AppState = {
  tableros: [
    {
      id: "t1",
      nombre: "Tablero Principal",
      activo: true,
      createdAt: Date.now(),
    },
  ],
  sprints: [
    {
      id: "s1",
      tableroId: "t1",
      nombre: "Sprint 1",
      activo: true,
      fechaInicio: Date.now(),
      fechaFin: Date.now() + 7 * 24 * 60 * 60 * 1000,
      archivado: false,
    },
  ],
  columnas: [
    { id: "c1", tableroId: "t1", nombre: "Sprint", orden: 0, wipLimit: 10 },
    { id: "c2", tableroId: "t1", nombre: "En curso", orden: 1, wipLimit: 3 },
    { id: "c3", tableroId: "t1", nombre: "Bloqueado", orden: 2 },
    { id: "c4", tableroId: "t1", nombre: "Fin", orden: 3 },
  ],
  tarjetas: [
    {
      id: "task1",
      titulo: "Diseñar la base de datos",
      descripcion: "Crear esquema inicial para la nueva funcionalidad.",
      tableroId: "t1",
      sprintId: "s1",
      columnaId: "c1",
      esfuerzo: "M",
      prioridad: "alta",
      orden: 0,
      parentId: null,
      createdAt: Date.now(),
    },
    {
      id: "task2",
      titulo: "Implementar el frontend",
      descripcion: "Desarrollar componentes de UI",
      tableroId: "t1",
      sprintId: "s1",
      columnaId: "c2",
      esfuerzo: "L",
      prioridad: "media",
      orden: 0,
      parentId: null,
      createdAt: Date.now(),
    },
    {
      id: "subtask1",
      titulo: "Crear Header",
      descripcion: "",
      tableroId: "t1",
      sprintId: "s1",
      columnaId: "c2",
      esfuerzo: "S",
      prioridad: "media",
      orden: 0,
      parentId: "task2",
      createdAt: Date.now(),
    },
    {
      id: "subtask2",
      titulo: "Crear Footer",
      descripcion: "",
      tableroId: "t1",
      sprintId: "s1",
      columnaId: "c1",
      esfuerzo: "XS",
      prioridad: "baja",
      orden: 0,
      parentId: "task2",
      createdAt: Date.now(),
    },
  ],
};

const STORAGE_KEY = "boardroom_state";

export function createEmptyState(): AppState {
  const tId = crypto.randomUUID();
  const sId = crypto.randomUUID();
  return {
    tableros: [
      { id: tId, nombre: "Mi Tablero", activo: true, createdAt: Date.now() },
    ],
    sprints: [
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
    tarjetas: [],
  };
}

export function loadState(): AppState {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return INITIAL_STATE;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state", err);
    return INITIAL_STATE;
  }
}

export function saveState(state: AppState) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Error saving state", err);
  }
}
