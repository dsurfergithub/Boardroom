export type Esfuerzo = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type Prioridad = 'baja' | 'media' | 'alta';

export const BOARD_COLORS = ['#0A84FF', '#32D74B', '#FF9F0A', '#BF5AF2', '#FF375F', '#00C7BE'];

export interface Tablero {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: number;
  color?: string;
}

export interface Sprint {
  id: string;
  tableroId: string;
  nombre: string;
  activo: boolean;
  fechaInicio: number;
  fechaFin: number;
  archivado: boolean;
}

export interface Columna {
  id: string;
  tableroId: string;
  nombre: string;
  orden: number;
  wipLimit?: number;
}

export interface Tarjeta {
  id: string;
  titulo: string;
  descripcion: string;
  tableroId: string;
  sprintId: string;
  columnaId: string;
  esfuerzo?: Esfuerzo;
  prioridad: Prioridad;
  orden: number;
  parentId: string | null;
  motivoBloqueo?: string;
  createdAt: number;
  fechaVencimiento?: number;
  etiquetas?: string[];
}

export interface AppState {
  tableros: Tablero[];
  sprints: Sprint[];
  columnas: Columna[];
  tarjetas: Tarjeta[];
}

export interface FiltrosActivos {
  texto: string;
  prioridades: Prioridad[];
  esfuerzos: Esfuerzo[];
  soloVencidas: boolean;
}

export const ESFUERZO_PUNTOS: Record<Esfuerzo, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
};
