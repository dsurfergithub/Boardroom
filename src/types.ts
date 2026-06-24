export type Esfuerzo = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type Prioridad = 'baja' | 'media' | 'alta';

export interface Tablero {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: number;
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
}

export interface AppState {
  tableros: Tablero[];
  sprints: Sprint[];
  columnas: Columna[];
  tarjetas: Tarjeta[];
}
