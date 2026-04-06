// app/api/perfil/route.ts
import { db } from "@/lib/db";
import { users, addresses } from "@/lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { perfilSchema, mapearErroresZod } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

export const runtime = "nodejs";

// Helper: asegura que el usuario exista en la DB
async function ensureUserExists(userId: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existing) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    const phone = clerkUser?.phoneNumbers[0]?.phoneNumber ?? null;

    if (!email) throw new Error("Sin email en Clerk");

    await db.insert(users).values({
      id: userId,
      email,
      phone,
      role: "customer",
    });
  }
}

// ================= GET =================
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    // Si el usuario no existe en la DB, lo creamos
    await ensureUserExists(userId);

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
    return logger.getErrorResponse("api/perfil GET", error);
  }
}

// ================= POST =================
export async function POST(req: Request) {
  try {
    // Rate limiting: 30 actualización de perfil por hora por IP
    const { allowed, response: rateLimitResponse } = await checkRateLimit(req, {
      maxRequests: 30,
      windowSeconds: 3600,
    });

    if (!allowed) {
      return rateLimitResponse!;
    }

    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    // Si el usuario no existe en la DB, lo creamos
    await ensureUserExists(userId);

    const body = await req.json();

    // Validar datos con Zod
    try {
      perfilSchema.parse({
        nombre: body.name,
        email: body.email,
        telefono: body.phone,
        dni: body.dni,
        direccion: body.street,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errores = mapearErroresZod(validationError);
        return new Response(
          JSON.stringify({ error: "Validación fallida", errors: errores }),
          { status: 400 }
        );
      }
      throw validationError;
    }

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

    await db.update(users)
      .set({ name, lastName, phone, dni })
      .where(eq(users.id, userId));

    const existingAddress = await db.query.addresses.findFirst({
      where: and(eq(addresses.userId, userId), eq(addresses.isDefault, true)),
    });

    if (existingAddress) {
      await db.update(addresses)
        .set({ street, number, floor, city, province, postalCode })
        .where(eq(addresses.id, existingAddress.id));
    } else {
      await db.insert(addresses).values({
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
    return logger.getErrorResponse("api/perfil POST", error);
  }
}