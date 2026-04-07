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
