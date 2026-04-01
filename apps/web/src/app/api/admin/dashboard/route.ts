import { db } from "@/lib/db";
import { solicitudes } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

export async function GET() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const conteos = await db
      .select({
        status: solicitudes.status,
        count: sql<number>`count(*)::int`,
      })
      .from(solicitudes)
      .groupBy(solicitudes.status);

    const result = {
      solicitud_enviada: 0,
      aprobada_pendiente_pago: 0,
      en_produccion: 0,
      despachado: 0,
      recibida: 0,
      cancelada: 0,
    };

    conteos.forEach(({ status, count }) => {
      if (status && status in result) {
        result[status as keyof typeof result] = count;
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}