import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  folder: string = "condoleo"
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto", // soporta PDF, imágenes, etc.
          public_id: `${Date.now()}-${fileName.replace(/\s+/g, "_")}`,
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}