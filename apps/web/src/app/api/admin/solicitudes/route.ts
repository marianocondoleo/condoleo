import { db } from "@/lib/db";
import { solicitudes } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { getProxyUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role;
    if (role !== "admin") {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Parsear parámetros de paginación
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    // Obtener solicitudes con paginación
    const data = await db.query.solicitudes.findMany({
      with: {
        product: true,
        user: {
          with: {
            addresses: true,
          },
        },
        files: true,
      },
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      limit,
      offset,
    });

    // Contar total de registros
    const allSolicitudes = await db.query.solicitudes.findMany({
      columns: { id: true },
    });
    const total = allSolicitudes.length;
    const totalPages = Math.ceil(total / limit);

    // Mapeo seguro con validación de URLs
    const mapped = data.map((s) => ({
      ...s,
      user: {
        ...s.user,
        last_name: s.user?.lastName || "",
      },
      files: (s.files ?? []).map((f) => ({
        ...f,
        url: getProxyUrl(f.url, true),
        isValid: f.url ? f.url.startsWith("http") : false,
      })),
    }));

    logger.info("admin/solicitudes GET", `Página ${page}/${totalPages}`, { limit, total });

    return Response.json({
      data: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return logger.getErrorResponse("api/admin/solicitudes GET", error);
  }
}