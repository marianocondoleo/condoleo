import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, addresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET - obtener datos del perfil
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const address = await db.select().from(addresses).where(eq(addresses.userId, userId)).limit(1);

  return NextResponse.json({
    user: user[0] ?? null,
    address: address[0] ?? null,
  });
}

// POST - guardar datos del perfil
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { phone, dni, street, number, floor, city, postalCode } = body;

  // Actualizar usuario
  await db.update(users)
    .set({ phone, dni })
    .where(eq(users.id, userId));

  // Upsert dirección
  const existing = await db.select().from(addresses).where(eq(addresses.userId, userId)).limit(1);

  if (existing.length > 0) {
    await db.update(addresses)
      .set({ street, number, floor, city, postalCode })
      .where(eq(addresses.userId, userId));
  } else {
    await db.insert(addresses).values({
      userId,
      street,
      number,
      floor,
      city,
      postalCode,
      isDefault: true,
    });
  }

  return NextResponse.json({ ok: true });
}