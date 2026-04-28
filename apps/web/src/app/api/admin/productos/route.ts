// app/api/admin/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { adminProductoSchema } from "@/lib/validations"; // ✅ Importar schema
import { z } from "zod"; // ✅ Para manejar ZodError
import { checkRateLimit } from "@/lib/rateLimit"; // ✅ Rate limiting

// GET /api/admin/productos
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await db.select().from(products).orderBy(products.createdAt);
    return NextResponse.json(data);
  } catch (error) {
    return logger.getErrorResponse("api/admin/productos GET", error);
  }
}

// POST /api/admin/productos
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // ✅ FIX 8: Rate limiting - máximo 10 requests por minuto
  const userId = (await auth()).userId || "admin";
  const { allowed, response: rateLimitResponse } = await checkRateLimit(req, {
    identifier: userId,
    limit: 10,
    window: 60,
  });
  if (!allowed) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    
    // ✅ CRÍTICO - Validar con Zod antes de insertar
    let validatedData;
    try {
      validatedData = adminProductoSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: "Datos inválidos",
            details: validationError.issues.map(e => ({
              field: e.path.join("."),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    const [producto] = await db
      .insert(products)
      .values({
        name: validatedData.name,
        sku: validatedData.sku,
        categoryId: validatedData.categoryId || null,
        price: validatedData.price,
        description: validatedData.description || null,
        images: validatedData.images,
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(producto, { status: 201 });
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    if (err?.code === "23505") {
      return NextResponse.json({ error: "El SKU ya existe" }, { status: 409 });
    }
    return logger.getErrorResponse("api/admin/productos POST", error);
  }
}