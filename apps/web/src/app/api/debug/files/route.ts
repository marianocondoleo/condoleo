import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { solicitudFiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * Endpoint de debugging para ver URLs de archivos en BD 
 * Solo para admin o desarrollo
 */
export async function GET(req: Request) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // Permitir solo en desarrollo
    if (process.env.NODE_ENV === "production" && role !== "admin") {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener los últimos 5 archivos subidos
    const files = await db.query.solicitudFiles.findMany({
      limit: 5,
    });

    const formatted = files.map((f) => ({
      id: f.id,
      url: f.url,
      urlLength: f.url?.length || 0,
      type: f.type,
      createdAt: f.createdAt,
      urlPreview: f.url?.substring(0, 200) || "N/A",
    }));

    logger.info("debug/files", "URLs de archivos en BD", {
      count: formatted.length,
    });

    return Response.json({
      files: formatted,
      note: "Endpoint solo para debugging",
    });
  } catch (error) {
    logger.error("debug/files", error);
    return Response.json(
      { error: "Error al obtener archivos", details: String(error) },
      { status: 500 }
    );
  }
}
