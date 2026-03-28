import { db } from "@/lib/db";
import { solicitudes } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const VALID_STATUSES = [
  "solicitud_enviada",
  "aprobada_pendiente_pago",
  "en_produccion",
  "despachado",
  "recibida",
  "cancelada",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ← fix punto 9: Promise
) {
  try {
    // Fix punto 2: verificar que sea admin
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin") {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params; // ← fix punto 9: await params

    const body = await req.json();
    const { status } = body;

    // Fix punto 12: validar que el status sea válido
    if (!status || !VALID_STATUSES.includes(status)) {
      return Response.json({ error: "Status inválido" }, { status: 400 });
    }

    const [updated] = await db
      .update(solicitudes)
      .set({
        status,
        updatedAt: new Date(), // ← fix punto 11: actualizar updatedAt
      })
      .where(eq(solicitudes.id, id))
      .returning();

    if (!updated) {
      return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}