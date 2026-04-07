/**
 * Utilidades de Cloudinary para uso en cliente
 * Transforma URLs de Cloudinary a URLs del proxy
 */

/**
 * Convertir URL de Cloudinary a URL de proxy
 * Se usa en el cliente como fallback
 */
export function ensureProxyUrl(url: string | undefined, inline: boolean = true): string {
  if (!url) return "";

  // Si ya es una URL del proxy, devolverla sin cambios
  if (url.includes("/api/files/download")) {
    return url;
  }

  // Si es URL de Cloudinary, convertir a proxy
  if (url.includes("cloudinary.com") || url.includes("res.cloudinary.com")) {
    const params = new URLSearchParams();
    params.set("url", url);
    params.set("inline", inline ? "true" : "false");
    return `/api/files/download?${params.toString()}`;
  }

  // Para otras URLs, retornar tal cual
  return url;
}
