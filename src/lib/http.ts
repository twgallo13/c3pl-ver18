// Central API base resolver. Prefers explicit env, else same-origin.
export function getApiBase(): string {
  const env = (import.meta as any).env;
  const explicit = env?.VITE_API_BASE as string | undefined;

  if (explicit && /^https?:\/\//i.test(explicit)) return explicit.replace(/\/+$/, '');
  // same-origin (works for Vite dev + preview + static hosting)
  return '';
}
