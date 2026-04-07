import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";
import { env } from "./env"; // ✅ Importar para validar en startup

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Obtener tipo de recurso basado en MIME type
 * Solo aceptamos imágenes, así que siempre retornamos "image"
 */
function getResourceType(mimeType: string): "image" {
  // Solo imágenes permitidas - Cloudinary sirve como asset público
  return "image";
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  folder: string = "condoleo",
  mimeType: string = "application/octet-stream"
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Sanitizar nombre del archivo (SIN extensión)
    // Cloudinary automáticamente añade la extensión correcta basada en el archivo
    const sanitizedFileName = fileName
      .substring(0, fileName.lastIndexOf(".") > 0 ? fileName.lastIndexOf(".") : fileName.length)
      .replace(/[^a-zA-Z0-9_-]/g, "_") // reemplazar caracteres especiales con guion bajo
      .substring(0, 40); // limitar longitud

    // NOT incluir extensión en publicId - Cloudinary la añade automáticamente
    const publicId = `${sanitizedFileName}_${Date.now()}`;

    const resourceType = getResourceType(mimeType);

    logger.info("uploadFile", "Iniciando upload a Cloudinary", {
      fileName,
      mimeType,
      resourceType,
      publicId,
      folder,
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType, // "upload" funciona para todos: imágenes, PDFs, documentos
        public_id: publicId,
        overwrite: false,
        type: "upload", // Asegurar que es un assetpúblico, no privado
      },
      (error, result) => {
        if (error) {
          logger.error("uploadFile - Cloudinary error", error, {
            folder,
            fileName,
            publicId,
            mimeType,
            resourceType,
          });
          return reject(error);
        }

        if (!result) {
          const err = new Error("Sin respuesta de Cloudinary");
          logger.error("uploadFile - No result", err, { publicId });
          return reject(err);
        }

        if (!result.secure_url) {
          const err = new Error("No secure_url en respuesta de Cloudinary");
          logger.error("uploadFile - No secure_url", err, {
            result: {
              public_id: result.public_id,
              resource_type: result.resource_type,
              type: result.type,
              format: result.format,
            },
          });
          return reject(err);
        }

        logger.info("uploadFile - SUCCESS", "Archivo subido exitosamente", {
          fileName,
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          size: result.bytes,
        });

        resolve(result.secure_url);
      }
    );

    uploadStream.on("error", (err) => {
      logger.error("uploadFile - Stream error", err, { fileName, publicId });
      reject(err);
    });

    uploadStream.end(buffer);
  });
}

/**
 * Convertir URL de Cloudinary a URL de proxy local
 * Esto permite servir PDFs y otros archivos correctamente en navegadores
 */
export function getProxyUrl(
  cloudinaryUrl: string,
  inline: boolean = true
): string {
  try {
    // Construir URL relativa al proxy (funciona mejor que URL absoluta)
    const params = new URLSearchParams();
    params.set("url", cloudinaryUrl);
    params.set("inline", inline ? "true" : "false");
    return `/api/files/download?${params.toString()}`;
  } catch (error) {
    logger.error("getProxyUrl", error, { cloudinaryUrl });
    // Fallback: retornar URL original si algo falla
    return cloudinaryUrl;
  }
}