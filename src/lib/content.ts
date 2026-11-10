import { useSyncExternalStore } from "react";
import { applyContent, currentContent, fetchPublishedContent, type Content } from "../../shared/catalog";

/**
 * Contenido de la tienda en el navegador: arranca con el último contenido publicado que se guardó en
 * caché (o el inicial), y lo sustituye por el de Supabase en cuanto llega.
 */
const CACHE_KEY = "sn_content";
let version = 0;
let previewing = false;
let published: Content = currentContent();
const listeners = new Set<() => void>();
const notify = () => { version += 1; listeners.forEach((listener) => listener()); };

try {
  const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
  if (cached && applyContent(cached)) published = currentContent();
} catch { /* sin caché */ }

export async function loadPublishedContent(): Promise<void> {
  const remote = await fetchPublishedContent();
  if (!remote || previewing) return;
  if (JSON.stringify(remote) === JSON.stringify(published)) return;
  if (!applyContent(remote)) return;
  published = currentContent();
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(published)); } catch { /* sin almacenamiento */ }
  notify();
}

export const getPublished = () => published;

/** El Creador llama a esto tras publicar: el contenido pasa a ser el oficial también en este navegador. */
export function setPublished(content: Content): void {
  applyContent(content);
  published = currentContent();
  previewing = false;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(published)); } catch { /* sin almacenamiento */ }
  notify();
}

/** Muestra un borrador en la tienda (solo en este navegador) sin publicarlo. */
export function previewDraft(draft: Content): void {
  if (applyContent(draft)) { previewing = true; notify(); }
}
export function stopPreview(): void {
  if (!previewing) return;
  applyContent(published);
  previewing = false;
  notify();
}
export const isPreviewing = () => previewing;

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
/** Cambia cada vez que cambia el contenido; úsalo como `key` o dependencia para volver a pintar. */
export const useContentVersion = () => useSyncExternalStore(subscribe, () => version);
