import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("Webhook secret no configurado", new Error("CLERK_WEBHOOK_SECRET not set"));
    return new Response("Webhook secret no configurado", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.error("Faltan headers de svix", new Error("Missing headers"), {
      svix_id: !!svix_id,
      svix_timestamp: !!svix_timestamp,
      svix_signature: !!svix_signature,
    });
    return new Response("Faltan headers de svix", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Webhook inválido", new Error(String(err)));
    return new Response("Webhook inválido", { status: 400 });
  }

  // ── user.created ──────────────────────────────────────────
  if (evt.type === "user.created") {
    const { id, email_addresses, phone_numbers, first_name, last_name } =
      evt.data;

    const email = email_addresses[0]?.email_address;
    const phone = phone_numbers[0]?.phone_number ?? null;

    if (!email) {
      logger.error("user.created: Sin email", new Error("Missing email"), { userId: id });
      return new Response("Sin email", { status: 400 });
    }

    try {
      await db.insert(users).values({
        id,
        email,
        name: first_name ?? null,
        lastName: last_name ?? null,
        phone,
        role: "customer",
      });

      logger.info("User webhook", "Usuario creado desde Clerk", {
        userId: id,
        email,
      });
    } catch (error) {
      logger.error("Error al crear usuario en BD", new Error(String(error)), {
        userId: id,
      });
      return new Response("Error al crear usuario", { status: 500 });
    }
  }

  // ── user.updated ──────────────────────────────────────────
  // Sincroniza email, teléfono, nombre si el usuario los cambia en Clerk
  if (evt.type === "user.updated") {
    const { id, email_addresses, phone_numbers, first_name, last_name } =
      evt.data;

    const email = email_addresses[0]?.email_address;
    const phone = phone_numbers[0]?.phone_number ?? null;

    if (!email) {
      logger.error("user.updated: Sin email", new Error("Missing email"), { userId: id });
      return new Response("Sin email", { status: 400 });
    }

    try {
      await db
        .update(users)
        .set({
          email,
          phone,
          name: first_name ?? null,
          lastName: last_name ?? null,
        })
        .where(eq(users.id, id));

      logger.info("User webhook", "Usuario actualizado desde Clerk", {
        userId: id,
        email,
      });
    } catch (error) {
      logger.error("Error al actualizar usuario en BD", new Error(String(error)), {
        userId: id,
      });
      return new Response("Error al actualizar usuario", { status: 500 });
    }
  }

  // ── user.deleted ──────────────────────────────────────────
  // Clerk elimina el usuario → lo eliminamos de la DB
  // Las solicitudes se eliminan en cascada por la FK
  if (evt.type === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      logger.error("user.deleted: Sin id", new Error("Missing id"));
      return new Response("Sin id", { status: 400 });
    }

    try {
      await db.delete(users).where(eq(users.id, id));

      logger.info("User webhook", "Usuario eliminado desde Clerk", { userId: id });
    } catch (error) {
      logger.error("Error al eliminar usuario de BD", new Error(String(error)), {
        userId: id,
      });
      return new Response("Error al eliminar usuario", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}