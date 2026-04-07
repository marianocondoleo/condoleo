import { z } from "zod";

/**
 * Esquema de validación para variables de entorno
 * Se ejecuta en startup y falla si falta algo crítico
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL válida"),

  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY requerida"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY requerida"),
  CLERK_WEBHOOK_SECRET: z.string().min(1, "CLERK_WEBHOOK_SECRET requerida"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME requerida"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY requerida"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET requerida"),

  // Resend (Email)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY requerida"),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL debe ser un email válido"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL debe ser un email válido"),

  // Upstash Redis (Opcional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),

  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Environment = z.infer<typeof envSchema>;

/**
 * Validar variables de entorno en startup
 * Lanza error si falta algo requerido
 */
export function validateEnvironment(): Environment {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Variables de entorno inválidas:");
      error.issues.forEach((err) => {
        console.error(`   ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error("Faltan variables de entorno requeridas. Ver logs arriba.");
    }
    throw error;
  }
}

// ✅ Validar en startup (se ejecuta cuando se importa este archivo)
export const env = validateEnvironment();
