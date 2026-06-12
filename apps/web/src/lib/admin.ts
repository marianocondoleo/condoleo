import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Obtiene el email del usuario admin desde la base de datos
 * Busca el primer usuario con role = "admin"
 */
export async function getAdminEmail(): Promise<string | null> {
  try {
    const admin = await db.query.users.findFirst({
      where: eq(users.role, "admin"),
      columns: {
        email: true,
      },
    });

    return admin?.email ?? null;
  } catch (error) {
    console.error("Error al obtener email del admin:", error);
    return null;
  }
}
