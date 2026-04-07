import { db } from "@/lib/db";
import { solicitudes, solicitudFiles, users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { uploadFile } from "@/lib/cloudinary";
import { crearSolicitudSchema, mapearErroresZod } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

export const runtime = "nodejs";

// Validaciones de archivo - Solo imágenes permitidas
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    // Rate limiting: 10 solicitudes por hora por IP
    const { allowed, response: rateLimitResponse } = await checkRateLimit(req, {
      limit: 10,
      window: 3600,
    });

    if (!allowed) {
      return rateLimitResponse!;
    }

    const { userId } = await auth();
    if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

    // Verificar que el usuario existe en la DB y tiene perfil completo
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
      with: { addresses: true },
    });

    if (!user) {
      return Response.json({
        error: "Debes completar tu perfil antes de enviar una solicitud.",
      }, { status: 403 });
    }

    if (!user.name || !user.lastName || !user.phone) {
      return Response.json({
        error: "Debés completar tu perfil (nombre, apellido y teléfono) antes de realizar una solicitud.",
      }, { status: 403 });
    }

    if (!user.addresses || user.addresses.length === 0) {
      return Response.json({
        error: "Debés agregar una dirección de entrega en tu perfil antes de realizar una solicitud.",
      }, { status: 403 });
    }

    const formData = await req.formData();

    const productId = formData.get("productId") as string;
    const talle = formData.get("talle") as string;
    const tipoMedida = formData.get("tipoMedida") as string;
    const medicoNombre = formData.get("medicoNombre") as string;
    const notas = formData.get("notas") as string;
    const file = formData.get("file") as File | null;

    // Validar datos obligatorios con Zod
    try {
      crearSolicitudSchema.parse({
        productoId: productId,
        talle,
        tipoMedida,
        medicoNombre,
        observaciones: notas,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errores = mapearErroresZod(validationError);
        return Response.json(
          { error: "Validación fallida", errors: errores },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Validar archivo si está presente
    if (file) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return Response.json(
          { error: "Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, WebP, GIF)." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: "El archivo no puede exceder 5MB." },
          { status: 400 }
        );
      }
    }

    const product = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, productId),
    });

    if (!product) {
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    let fileUrl: string | null = null;
    if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        logger.info("api/solicitudes POST", "Subiendo archivo a Cloudinary", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
        fileUrl = await uploadFile(
          buffer,
          file.name,
          "condoleo/ordenes-medicas",
          file.type || "application/octet-stream"
        );
        logger.info("api/solicitudes POST", "Archivo subido exitosamente", {
          fileUrl,
        });
      } catch (uploadError) {
        logger.error("api/solicitudes POST - Upload", uploadError, {
          fileName: file?.name,
          fileType: file?.type,
        });
        // NO fallar si Cloudinary falla, continuar sin archivo
        logger.warn("api/solicitudes POST", "Continuando sin archivo debido a error");
      }
    }

    const [nueva] = await db.insert(solicitudes).values({
      userId,
      productId,
      talle,
      tipoMedida,
      medicoNombre: medicoNombre || null,
      notas: notas || null,
      precioProducto: product.price,
      precioTotal: product.price,
      status: "solicitud_enviada",
    }).returning();

    if (fileUrl) {
      try {
        await db.insert(solicitudFiles).values({
          id: crypto.randomUUID(),
          solicitudId: nueva.id,
          url: fileUrl,
          type: file?.name || null,
        });
        logger.info("api/solicitudes POST", "Archivo guardado en BD", {
          solicitudId: nueva.id,
          fileUrl,
        });
      } catch (dbError) {
        logger.error("api/solicitudes POST - DB", dbError, {
          solicitudId: nueva.id,
          fileUrl,
        });
        // Log pero no falla la solicitud
      }
    }

    logger.info("api/solicitudes POST", `Nueva solicitud creada: ${nueva.id}`, {
      userId,
      productId,
      hasFile: !!fileUrl,
    });
    return Response.json({ success: true, solicitud: nueva });
  } catch (error) {
    return logger.getErrorResponse("api/solicitudes POST", error);
  }
}