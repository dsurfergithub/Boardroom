import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date locally
export function formatLocal(dateNum: number): string {
  const date = new Date(dateNum);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Format short DD/MM
export function formatShort(dateNum: number): string {
  const date = new Date(dateNum);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

// Convert a yyyy-mm-dd input string to a timestamp (local noon to avoid TZ drift)
export function dateInputToTimestamp(value: string): number | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d, 12, 0, 0).getTime();
}

// Convert a timestamp to a yyyy-mm-dd input string
export function timestampToDateInput(ts?: number): string {
  if (!ts) return '';
  const date = new Date(ts);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Days difference from now (positive = future, negative = past)
export function daysUntil(ts: number): number {
  const startOfDay = (n: number) => {
    const d = new Date(n);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const diff = startOfDay(ts) - startOfDay(Date.now());
  return Math.round(diff / (24 * 60 * 60 * 1000));
}
