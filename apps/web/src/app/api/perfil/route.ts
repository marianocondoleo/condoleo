// app/api/perfil/route.ts
import { db } from "@/lib/db";
import { users, addresses } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

// ================= GET =================
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    // Traemos datos del usuario
    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        phone: true,
        dni: true,
        name: true,
        lastName: true,
        email: true,
      },
    });

    // Traemos la dirección por defecto (si existe)
    const address = await db.query.addresses.findFirst({
      where: and(eq(addresses.userId, userId), eq(addresses.isDefault, true)),
      columns: {
        street: true,
        number: true,
        floor: true,
        city: true,
        province: true,
        postalCode: true,
      },
    });

    return new Response(JSON.stringify({ user: userProfile, address }), { status: 200 });
  } catch (error) {
    console.error("❌ ERROR API PERFIL GET:", error);
    return new Response(
      JSON.stringify({ error: "Error interno", detalle: String(error) }),
      { status: 500 }
    );
  }
}

// ================= POST =================
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    const body = await req.json();

    // Validamos y normalizamos los campos
    const name = body.name ?? "";
    const lastName = body.lastName ?? "";
    const phone = body.phone ?? "";
    const dni = body.dni ?? "";
    const street = body.street ?? "";
    const number = body.number ?? "";
    const floor = body.floor ?? "";
    const city = body.city ?? "";
    const province = body.province ?? "";
    const postalCode = body.postalCode ?? "";

    // 1️⃣ Actualizamos los datos del usuario
    const updateUserResult = await db.update(users)
      .set({ name, lastName, phone, dni })
      .where(eq(users.id, userId));


    // 2️⃣ Actualizamos o creamos la dirección por defecto
    const existingAddress = await db.query.addresses.findFirst({
      where: and(eq(addresses.userId, userId), eq(addresses.isDefault, true)),
    });

    if (existingAddress) {
      const updateAddressResult = await db.update(addresses)
        .set({ street, number, floor, city, province, postalCode })
        .where(eq(addresses.id, existingAddress.id));


    } else {
      const insertAddressResult = await db.insert(addresses).values({
        userId,
        street,
        number,
        floor,
        city,
        province,
        postalCode,
        isDefault: true,
      });


    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("❌ ERROR API PERFIL POST:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), { status: 500 });
  }
}