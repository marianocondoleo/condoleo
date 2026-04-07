/**
 * Utilidades de autenticación y autorización
 */

import { auth } from "@clerk/nextjs/server";

/**
 * Verificar que el usuario tiene rol de admin
 * @returns true si es admin, false si no
 */
export async function isAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  return role === "admin";
}

/**
 * Requerir autenticación como admin, sino retorna error 401
 * Uso: if (!await requireAdmin()) return Response.json(..., { status: 401 })
 */
export async function requireAdmin(): Promise<boolean> {
  return await isAdmin();
}

/**
 * Helper para retornar error 401 cuando no es admin
 * Uso: const error = await requireAdminOrReturn(); if (error) return error;
 */
export async function requireAdminOrReturn() {
  if (!(await isAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
