ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_method";--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('transferencia');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE "public"."payment_method" USING "method"::"public"."payment_method";--> statement-breakpoint
ALTER TABLE "solicitudes" ADD COLUMN "mensaje_cliente" text;--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "mp_payment_id";--> statement-breakpoint
ALTER TABLE "solicitudes" DROP COLUMN "medida";