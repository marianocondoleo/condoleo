import { pgTable, text, numeric, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const orderStatusEnum = pgEnum("order_status", [
  "pending", "confirmed", "packed", "shipped", "delivered", "cancelled"
]);

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

// Tablas
export const users = pgTable("users", {
  id:        text("id").primaryKey(),
  email:     text("email").notNull().unique(),
  phone:     text("phone"),
  dni: text("dni"),
  role:      userRoleEnum("role").default("customer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:         text("name").notNull(),
  slug:         text("slug").notNull().unique(),
  parentId:     text("parent_id"),
  displayOrder: integer("display_order").default(0),
});

export const products = pgTable("products", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text("name").notNull(),
  sku:           text("sku").notNull().unique(),
  categoryId:    text("category_id").references(() => categories.id),
  pricePerKg:    numeric("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  stockKg:       numeric("stock_kg", { precision: 10, scale: 3 }).notNull().default("0"),
  origin:        text("origin"),
  breed:         text("breed"),
  slaughterDate: timestamp("slaughter_date"),
  images:        text("images").array(),
  isActive:      boolean("is_active").default(true),
  createdAt:     timestamp("created_at").defaultNow(),
});

export const addresses = pgTable("addresses", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").references(() => users.id),
  street:    text("street").notNull(),
  number:    text("number").notNull(),
  floor:      text("floor"),
  postalCode: text("postal_code"),
  city:      text("city").notNull(),
  zone:      text("zone"),
  lat:       numeric("lat", { precision: 10, scale: 7 }),
  lng:       numeric("lng", { precision: 10, scale: 7 }),
  isDefault: boolean("is_default").default(false),
});

export const deliveryZones = pgTable("delivery_zones", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:         text("name").notNull(),
  deliveryDays: text("delivery_days").array(),
  minOrder:     numeric("min_order", { precision: 10, scale: 2 }),
  fee:          numeric("fee", { precision: 10, scale: 2 }).default("0"),
});

export const orders = pgTable("orders", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:       text("user_id").references(() => users.id),
  status:       orderStatusEnum("status").default("pending"),
  total:        numeric("total", { precision: 10, scale: 2 }).notNull(),
  mpPaymentId:  text("mp_payment_id"),
  deliveryDate: timestamp("delivery_date"),
  deliverySlot: text("delivery_slot"),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId:       text("order_id").references(() => orders.id),
  productId:     text("product_id").references(() => products.id),
  quantityKg:    numeric("quantity_kg", { precision: 10, scale: 3 }).notNull(),
  priceSnapshot: numeric("price_snapshot", { precision: 10, scale: 2 }).notNull(),
  unitPrice:     numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
});