import {
  pgTable,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "admin",
]);

export const solicitudStatusEnum = pgEnum("solicitud_status", [
  "solicitud_enviada",
  "aprobada_pendiente_pago",
  "en_produccion",
  "despachado",
  "recibida",
  "cancelada",
]);


export const paymentMethodEnum = pgEnum("payment_method", [
  "transferencia",
]);

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk ID

  email: text("email").notNull().unique(),
  name: text("name"),
  lastName: text("last_name"),
  phone: text("phone"),
  dni: text("dni"),

  role: userRoleEnum("role").default("customer"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   ADDRESSES
========================= */

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  street: text("street").notNull(),
  number: text("number").notNull(),
  floor: text("floor"),
  city: text("city").notNull(),
  province: text("province"),
  postalCode: text("postal_code"),

  isDefault: boolean("is_default").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   CATEGORIES
========================= */

export const categories = pgTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  parentId: text("parent_id"),

  displayOrder: integer("display_order").default(0),
});

/* =========================
   PRODUCTS (PLANTILLAS)
========================= */

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),

  categoryId: text("category_id").references(() => categories.id),

  price: numeric("price", { precision: 10, scale: 2 }).notNull(),

  description: text("description"),
  images: text("images").array(),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   SOLICITUDES
========================= */

export const solicitudes = pgTable("solicitudes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  productId: text("product_id")
    .references(() => products.id)
    .notNull(),

  status: solicitudStatusEnum("status").default("solicitud_enviada"),

  // Datos clínicos
  // DESPUÉS
  talle: text("talle").notNull(),
  tipoMedida: text("tipo_medida").notNull(), // "cm" o "calzado"
  medicoNombre: text("medico_nombre"),
  notas: text("notas"),

  // PRECIOS CONGELADOS
  precioProducto: numeric("precio_producto", {
    precision: 10,
    scale: 2,
  }),

  precioEnvio: numeric("precio_envio", {
    precision: 10,
    scale: 2,
  }),

  precioTotal: numeric("precio_total", {
    precision: 10,
    scale: 2,
  }),

  // ENVÍO (Andreani)
  envioModalidad: text("envio_modalidad"),
  envioTracking: text("envio_tracking"),
  andreaniShipmentId: text("andreani_shipment_id"),
  andreaniRawResponse: text("andreani_raw_response"),

  // SNAPSHOT DIRECCIÓN
  shippingAddressId: text("shipping_address_id"),

  // ADMIN
  adminNotes: text("admin_notes"),
  mensajeCliente: text("mensaje_cliente"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   HISTORIAL DE ESTADOS
========================= */

export const solicitudStatusHistory = pgTable(
  "solicitud_status_history",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

    solicitudId: text("solicitud_id")
      .references(() => solicitudes.id, { onDelete: "cascade" })
      .notNull(),

    status: solicitudStatusEnum("status").notNull(),

    changedBy: text("changed_by"), // user o admin

    createdAt: timestamp("created_at").defaultNow(),
  }
);

/* =========================
   ARCHIVOS (ORDEN MÉDICA, ETC)
========================= */

export const solicitudFiles = pgTable("solicitud_files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  solicitudId: text("solicitud_id")
    .references(() => solicitudes.id, { onDelete: "cascade" })
    .notNull(),

  url: text("url").notNull(),
  type: text("type"), // orden_medica, foto_pie, etc

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   PAGOS
========================= */

export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  solicitudId: text("solicitud_id")
    .references(() => solicitudes.id, { onDelete: "cascade" })
    .notNull(),

  method: paymentMethodEnum("method").notNull(),

  amount: numeric("amount", {
    precision: 10,
    scale: 2,
  }),

  status: text("status"), // pending, approved, rejected

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   CONFIG PAGOS
========================= */

export const paymentConfig = pgTable("payment_config", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  method: text("method").notNull(),
  label: text("label").notNull(),
  icon: text("icon"),

  isActive: boolean("is_active").default(true),

  // Transferencia
  bankName: text("bank_name"),
  cbu: text("cbu"),
  alias: text("alias"),
  titular: text("titular"),

  whatsapp: text("whatsapp"),
});

/* =========================
   CONFIG ENVÍOS (opcional)
========================= */

export const deliveryConfig = pgTable("delivery_config", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),

  type: text("type").notNull(),
  value: text("value").notNull(),

  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
});