/**
 * Conexión con Supabase (contenido editable desde el modo Creador).
 * La URL y la clave «publishable» son públicas por diseño: la seguridad está en las reglas (RLS) de la base de datos.
 * Se pueden sustituir con las variables VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.
 */
const viteEnv = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}) as Record<string, string | undefined>;
const nodeEnv: Record<string, string | undefined> = typeof process !== "undefined" && process.env ? process.env : {};
const read = (name: string) => (viteEnv[name] ?? nodeEnv[name] ?? "").trim();

export const SUPABASE_URL = (read("VITE_SUPABASE_URL") || "https://qhxguoirfnyylqyiyqja.supabase.co").replace(/\/+$/, "");
export const SUPABASE_KEY = read("VITE_SUPABASE_PUBLISHABLE_KEY") || "sb_publishable_0OopqkQAgnhuw8ihGnqoKg_5gKFB7of";
export const CONTENT_ROW = "main";
export const IMAGE_BUCKET = "sn-images";
