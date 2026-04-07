import { z } from "zod";

// Validaciones para el perfil de usuario
export const perfilSchema = z.object({
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  
  email: z.string()
    .email("Email inválido")
    .toLowerCase()
    .trim(),
  
  telefono: z.string()
    .regex(/^[0-9\s\-\+\(\)]+$/, "Teléfono con formato inválido")
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(20, "El teléfono no puede exceder 20 caracteres"),
  
  dni: z.string()
    .regex(/^[0-9]{7,8}$/, "DNI debe tener 7 u 8 dígitos")
    .trim(),
  
  direccion: z.string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres")
    .trim(),
});

export type PerfilInput = z.infer<typeof perfilSchema>;

// Validaciones para crear solicitud
export const crearSolicitudSchema = z.object({
  productoId: z.string()
    .min(1, "Debe seleccionar un producto")
    .uuid("ID de producto inválido"),
  
  talle: z.string()
    .min(1, "El talle es obligatorio")
    .max(50, "Talle no válido"),
  
  tipoMedida: z.string()
    .min(1, "El tipo de medida es obligatorio")
    .max(50, "Tipo de medida no válido"),
  
  medicoNombre: z.string()
    .min(1, "El nombre del médico es obligatorio")
    .max(100, "Nombre del médico muy largo"),
  
  medicoEmail: z.string()
    .email("Email del médico inválido")
    .optional()
    .or(z.literal("")),
  
  medicoTelefono: z.string()
    .regex(/^[0-9\s\-\+\(\)]+$/, "Teléfono del médico con formato inválido")
    .optional()
    .or(z.literal("")),
  
  observaciones: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
  
  // Validación opcional para archivo (cuando sea FormData no se puede validar aquí,
  // pero se valida en el endpoint)
});

export type CrearSolicitudInput = z.infer<typeof crearSolicitudSchema>;

// Validaciones para crear/actualizar producto
export const crearProductoSchema = z.object({
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .trim(),
  
  descripcion: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional()
    .or(z.literal("")),
  
  sku: z.string()
    .min(1, "El SKU es obligatorio")
    .max(50, "El SKU no puede exceder 50 caracteres")
    .regex(/^[A-Z0-9\-_]+$/, "El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos")
    .trim(),
  
  precioProducto: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "El precio debe ser un número")
    .refine((val) => parseFloat(val) > 0, "El precio debe ser mayor a 0")
    .refine((val) => parseFloat(val) <= 999999.99, "El precio no puede exceder 999,999.99"),
  
  categoriaId: z.string()
    .min(1, "Debe seleccionar una categoría")
    .uuid("ID de categoría inválido"),
  
  isActive: z.boolean()
    .optional()
    .default(true),
  
  images: z.array(z.string().url("URL de imagen inválida"))
    .optional()
    .default([]),
});

export type CrearProductoInput = z.infer<typeof crearProductoSchema>;

// Validaciones para actualizar estado de solicitud
export const actualizarSolicitudStatusSchema = z.object({
  status: z.enum(
    ["solicitud_enviada", "aprobada_pendiente_pago", "en_produccion", "despachado", "recibida", "cancelada"] as const
  ).describe("Estado de solicitud"),
  
  precioProducto: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "El precio debe ser un número")
    .refine((val) => parseFloat(val) >= 0, "El precio no puede ser negativo")
    .refine((val) => parseFloat(val) <= 999999.99, "El precio no puede exceder 999,999.99")
    .optional()
    .or(z.literal("")),
  
  precioEnvio: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "El precio de envío debe ser un número")
    .refine((val) => parseFloat(val) >= 0, "El precio de envío no puede ser negativo")
    .refine((val) => parseFloat(val) <= 999999.99, "El precio de envío no puede exceder 999,999.99")
    .optional()
    .or(z.literal("")),
  
  precioTotal: z.string()
    .refine((val) => !isNaN(parseFloat(val)), "El precio total debe ser un número")
    .refine((val) => parseFloat(val) >= 0, "El precio total no puede ser negativo")
    .refine((val) => parseFloat(val) <= 999999.99, "El precio total no puede exceder 999,999.99")
    .optional()
    .or(z.literal("")),
});

export type ActualizarSolicitudStatusInput = z.infer<typeof actualizarSolicitudStatusSchema>;

// Validaciones para configuración de métodos de pago
export const crearMetodoPagoSchema = z.object({
  method: z.enum(["transferencia"] as const).describe("Método de pago"),
  
  label: z.string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(100, "La descripción no puede exceder 100 caracteres")
    .trim(),
  
  bankName: z.string()
    .min(1, "El nombre del banco es obligatorio")
    .max(100, "Nombre del banco muy largo")
    .optional()
    .or(z.literal("")),
  
  cbu: z.string()
    .regex(/^[0-9]{22}$/, "CBU debe tener 22 dígitos")
    .optional()
    .or(z.literal("")),
  
  alias: z.string()
    .min(6, "El alias debe tener al menos 6 caracteres")
    .max(50, "El alias no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CrearMetodoPagoInput = z.infer<typeof crearMetodoPagoSchema>;

// Validaciones para uploads de archivos
export const validarArchivoSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "El archivo no puede exceder 5MB")
    .refine(
      (file) => ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Solo se permiten PDF, JPEG, PNG y WEBP"
    ),
});

// Función helper para validar y procesar errores
export function validarDatos<T>(schema: z.ZodSchema<T>, datos: unknown): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const data = schema.parse(datos);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Helper para obtener primer mensaje de error
export function getPrimemerErrorMessage(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message || "Datos inválidos";
}

// Helper para mapear errores de Zod a un objeto
export function mapearErroresZod(error: z.ZodError): Record<string, string> {
  const errores: Record<string, string> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errores[path]) {
      errores[path] = issue.message;
    }
  }
  
  return errores;
}

/* ==============================================
   🔴 CRÍTICO - ADMIN VALIDATION SCHEMAS (Fix 3)
   Prevents data corruption and SQL injection
   ============================================== */

/**
 * Admin Product Validation
 * Used for POST /api/admin/productos and PUT /api/admin/productos/[id]
 */
export const adminProductoSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim(),

  sku: z
    .string()
    .min(1, "El SKU es requerido")
    .max(100, "El SKU no puede exceder 100 caracteres")
    .regex(/^[A-Z0-9-]+$/, "El SKU solo puede contener letras mayúsculas, números y guiones")
    .trim(),

  price: z
    .coerce
    .number()
    .positive("El precio debe ser mayor a 0")
    .multipleOf(0.01, "El precio solo puede tener hasta 2 decimales")
    .max(999999.99, "El precio no puede exceder 999,999.99")
    .transform((val) => val.toString()),

  description: z
    .string()
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional()
    .or(z.literal("")),

  categoryId: z
    .string()
    .uuid("El categoryId debe ser un UUID válido")
    .optional()
    .or(z.literal("")),

  images: z
    .array(
      z
        .string()
        .url("Cada imagen debe ser una URL válida")
        .startsWith("https://", "Las imágenes deben usar HTTPS")
    )
    .optional()
    .default([]),

  isActive: z.boolean().default(true),
});

export type AdminProductoInput = z.infer<typeof adminProductoSchema>;

/**
 * Admin Payment Config Validation
 * Used for POST /api/admin/payment-config and PUT /api/admin/payment-config/[id]
 */
export const adminPaymentConfigSchema = z.object({
  method: z
    .string()
    .min(1, "El método de pago es requerido")
    .max(50, "El método de pago no puede exceder 50 caracteres")
    .regex(/^[a-z_]+$/, "El método solo puede contener letras minúsculas y guiones bajos")
    .trim(),

  label: z
    .string()
    .min(1, "La etiqueta es requerida")
    .max(100, "La etiqueta no puede exceder 100 caracteres")
    .trim(),

  icon: z
    .string()
    .max(100, "El icono no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),

  // Banco data (banco transfer)
  bankName: z
    .string()
    .max(100, "El nombre del banco no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),

  cbu: z
    .string()
    .regex(/^\d{22}$/, "El CBU debe tener exactamente 22 dígitos")
    .optional()
    .or(z.literal("")),

  alias: z
    .string()
    .regex(/^[a-z0-9]{6,}(\.)[a-z0-9]{6,}(\.)[a-z0-9]{6,}$/, "El alias debe cumplir formato de alias bancario")
    .optional()
    .or(z.literal("")),

  titular: z
    .string()
    .max(100, "El titular no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),

  whatsapp: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "El WhatsApp debe ser un número válido")
    .optional()
    .or(z.literal("")),
});

export type AdminPaymentConfigInput = z.infer<typeof adminPaymentConfigSchema>;

/**
 * Update schemas (partial for PUT requests)
 */
export const adminProductoUpdateSchema = adminProductoSchema.partial();
export type AdminProductoUpdateInput = z.infer<typeof adminProductoUpdateSchema>;

export const adminPaymentConfigUpdateSchema = adminPaymentConfigSchema.partial();
export type AdminPaymentConfigUpdateInput = z.infer<typeof adminPaymentConfigUpdateSchema>;
