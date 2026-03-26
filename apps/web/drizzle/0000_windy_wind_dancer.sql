CREATE TYPE "public"."payment_method" AS ENUM('mercadopago', 'transferencia');--> statement-breakpoint
CREATE TYPE "public"."pie" AS ENUM('izquierdo', 'derecho', 'ambos');--> statement-breakpoint
CREATE TYPE "public"."solicitud_status" AS ENUM('draft', 'submitted', 'reviewing', 'approved', 'rejected', 'payment_pending', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"street" text NOT NULL,
	"number" text NOT NULL,
	"floor" text,
	"city" text NOT NULL,
	"province" text,
	"postal_code" text,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" text,
	"display_order" integer DEFAULT 0,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "delivery_config" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "payment_config" (
	"id" text PRIMARY KEY NOT NULL,
	"method" text NOT NULL,
	"label" text NOT NULL,
	"icon" text,
	"is_active" boolean DEFAULT true,
	"bank_name" text,
	"cbu" text,
	"alias" text,
	"titular" text,
	"whatsapp" text
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"solicitud_id" text NOT NULL,
	"method" "payment_method" NOT NULL,
	"amount" numeric(10, 2),
	"status" text,
	"mp_payment_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"category_id" text,
	"price" numeric(10, 2) NOT NULL,
	"description" text,
	"images" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "solicitud_files" (
	"id" text PRIMARY KEY NOT NULL,
	"solicitud_id" text NOT NULL,
	"url" text NOT NULL,
	"type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "solicitud_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"solicitud_id" text NOT NULL,
	"status" "solicitud_status" NOT NULL,
	"changed_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "solicitudes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"status" "solicitud_status" DEFAULT 'draft',
	"talle" text NOT NULL,
	"pie" "pie" NOT NULL,
	"medico_nombre" text,
	"notas" text,
	"precio_producto" numeric(10, 2),
	"precio_envio" numeric(10, 2),
	"precio_total" numeric(10, 2),
	"envio_modalidad" text,
	"envio_tracking" text,
	"andreani_shipment_id" text,
	"andreani_raw_response" text,
	"shipping_address_id" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"last_name" text,
	"phone" text,
	"dni" text,
	"role" "user_role" DEFAULT 'customer',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_solicitud_id_solicitudes_id_fk" FOREIGN KEY ("solicitud_id") REFERENCES "public"."solicitudes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitud_files" ADD CONSTRAINT "solicitud_files_solicitud_id_solicitudes_id_fk" FOREIGN KEY ("solicitud_id") REFERENCES "public"."solicitudes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitud_status_history" ADD CONSTRAINT "solicitud_status_history_solicitud_id_solicitudes_id_fk" FOREIGN KEY ("solicitud_id") REFERENCES "public"."solicitudes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;