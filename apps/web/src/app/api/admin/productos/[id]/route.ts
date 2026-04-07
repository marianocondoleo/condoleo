// app/api/admin/productos/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { adminProductoUpdateSchema } from "@/lib/validations"; // ✅ Importar schema
import { z } from "zod"; // ✅ Para manejar ZodError

// PUT
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;  // ← await
    const body = await req.json();
    
    // ✅ CRÍTICO - Validar con Zod antes de actualizar
    let validatedData;
    try {
      validatedData = adminProductoUpdateSchema.parse(body);
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

    // Construir objeto de actualización solo con campos validados
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.sku !== undefined) updateData.sku = validatedData.sku;
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId || null;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.images !== undefined) updateData.images = validatedData.images;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))  // ← id en lugar de params.id
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "El SKU ya existe" }, { status: 409 });
    }
    return logger.getErrorResponse("api/admin/productos PUT", error);
  }
}

// DELETE
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;  // ← await

    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, id))  // ← id en lugar de params.id
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message?.includes("Failed query") || error?.code === "23503") {
      return NextResponse.json(
        { error: "No se puede eliminar: el producto tiene solicitudes asociadas." },
        { status: 409 }
      );
    }
    return logger.getErrorResponse("api/admin/productos DELETE", error);
  }
}