import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret no configurado", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
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
    return new Response("Webhook inválido", { status: 400 });
  }

  // ── user.created ──────────────────────────────────────────
  if (evt.type === "user.created") {
    const { id, email_addresses, phone_numbers } = evt.data;

    const email = email_addresses[0]?.email_address;
    const phone = phone_numbers[0]?.phone_number ?? null;

    if (!email) {
      return new Response("Sin email", { status: 400 });
    }

    await db.insert(users).values({
      id,
      email,
      phone,
      role: "customer",
    });
  }

  // ── user.updated ──────────────────────────────────────────
  // Sincroniza email y teléfono si el usuario los cambia en Clerk
  if (evt.type === "user.updated") {
    const { id, email_addresses, phone_numbers } = evt.data;

    const email = email_addresses[0]?.email_address;
    const phone = phone_numbers[0]?.phone_number ?? null;

    if (!email) {
      return new Response("Sin email", { status: 400 });
    }

    await db
      .update(users)
      .set({ email, phone })
      .where(eq(users.id, id));
  }

  // ── user.deleted ──────────────────────────────────────────
  // Clerk elimina el usuario → lo eliminamos de la DB
  // Las solicitudes se eliminan en cascada por la FK
  if (evt.type === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("Sin id", { status: 400 });
    }

    await db.delete(users).where(eq(users.id, id));
  }

  return new Response("OK", { status: 200 });
}