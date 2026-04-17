import { get, set, del } from 'idb-keyval';
import type { CanvasState } from '@/types';

const CANVAS_KEY = 'ponder-canvas-v1';

export async function saveCanvas(state: CanvasState): Promise<void> {
  await set(CANVAS_KEY, state);
}

export async function loadCanvas(): Promise<CanvasState | null> {
  const state = await get<CanvasState>(CANVAS_KEY);
  return state ?? null;
}

export async function clearCanvas(): Promise<void> {
  await del(CANVAS_KEY);
}
