import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { getProxyUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // 🔐 Auth (Clerk)
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    // Parsear parámetros de paginación
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    // 🔍 Buscar solicitudes del usuario con paginación
    const userSolicitudes = await db.query.solicitudes.findMany({
      where: (s, { eq }) => eq(s.userId, userId),
      orderBy: (s, { desc }) => desc(s.createdAt),
      with: {
        product: true,
        files: true,
        user: true,
      },
      limit,
      offset,
    });

    // Contar total
    const allUserSolicitudes = await db.query.solicitudes.findMany({
      where: (s, { eq }) => eq(s.userId, userId),
      columns: { id: true },
    });
    const total = allUserSolicitudes.length;
    const totalPages = Math.ceil(total / limit);

    // Convertimos campos numéricos a string para que JSON no rompa
    const formatted = userSolicitudes.map((s) => ({
      ...s,
      precioProducto: s.precioProducto?.toString() || "0",
      precioEnvio: s.precioEnvio?.toString() || "0",
      precioTotal: s.precioTotal?.toString() || "0",
      // Convertir URLs de archivos a URLs de proxy
      files: (s.files || []).map((f) => ({
        ...f,
        url: getProxyUrl(f.url, true), // true = visualizar en navegador, false = descargar
      })),
    }));

    logger.info("mis-solicitudes GET", `Página ${page}/${totalPages}`, { userId, total });

    return new Response(
      JSON.stringify({
        data: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    return logger.getErrorResponse("api/mis-solicitudes GET", error);
  }
}