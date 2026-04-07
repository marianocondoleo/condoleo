/**
 * Escapear caracteres HTML para prevenir XSS en emails
 * Convierte caracteres especiales en entidades HTML
 */
export function escapeHtml(text: string | undefined | null): string {
  if (!text) return "";
  
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
