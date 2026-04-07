import { logger } from "@/lib/logger";

/**
 * Endpoint proxy para descargar/servir archivos de Cloudinary
 * Recibe la URL de Cloudinary como parámetro y la sirve correctamente
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fileUrl = url.searchParams.get("url");
    const inline = url.searchParams.get("inline") === "true"; // true para visualizar, false para descargar

    if (!fileUrl) {
      logger.error("files/download", new Error("URL del archivo requerida"), { missingUrl: true });
      return Response.json(
        { error: "URL del archivo requerida" },
        { status: 400 }
      );
    }

    // Validar que es una URL de Cloudinary para seguridad
    if (!fileUrl.includes("cloudinary.com") && !fileUrl.includes("res.cloudinary.com")) {
      logger.error("files/download", new Error("URL no autorizada"), { fileUrl: fileUrl.substring(0, 100) });
      return Response.json(
        { error: "URL no autorizada" },
        { status: 403 }
      );
    }

    logger.info("files/download", "Iniciando descarga de archivo", {
      fileUrl: fileUrl.substring(0, 150),
      inline,
    });

    // Obtener el archivo de Cloudinary con timeout
    let response;
    try {
      response = await Promise.race([
        fetch(fileUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Cloudinary-Proxy)",
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout al obtener archivo")), 10000)
        ),
      ]) as Response;
    } catch (fetchError) {
      logger.error("files/download - Fetch error", fetchError, {
        fileUrl: fileUrl.substring(0, 100),
        message: String(fetchError),
      });
      // NO exponer detalles técnicos al cliente
      return Response.json(
        { error: "Error al obtener el archivo" },
        { status: 502 }
      );
    }

    if (!response.ok) {
      logger.error("files/download - Bad response", new Error(`Status ${response.status}`), {
        responseStatus: response.status,
        fileUrl: fileUrl.substring(0, 300), // logging seguro (truncado)
        contentType: response.headers.get("content-type"),
      });
      // NO exponer la URL en la respuesta al cliente
      return Response.json(
        {
          error: "No se pudo obtener el archivo",
          details: `Error ${response.status} al acceder al archivo`,
        },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    if (buffer.byteLength === 0) {
      logger.error("files/download - Empty buffer", new Error("Respuesta vacía"));
      return Response.json(
        { error: "Archivo vacío recibido de Cloudinary" },
        { status: 502 }
      );
    }

    // Extraer nombre de archivo de la URL
    let fileName = "archivo";
    try {
      const urlParts = fileUrl.split("/");
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart.includes(".")) {
        fileName = lastPart.split("?")[0]; // quitar query params
      }
    } catch (e) {
      logger.warn("files/download", "No se pudo extraer nombre de archivo de URL");
    }

    logger.info("files/download - SUCCESS", "Archivo servido correctamente", {
      fileName,
      fileSize: buffer.byteLength,
      contentType,
    });

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": inline
          ? `inline; filename="${fileName}"`
          : `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=86400", // cachear por 24h
      },
    });
  } catch (error) {
    logger.error("files/download - Unhandled error", error);
    // NO exponer detalles de error al cliente
    return Response.json(
      { error: "Error al descargar archivo" },
      { status: 500 }
    );
  }
}
