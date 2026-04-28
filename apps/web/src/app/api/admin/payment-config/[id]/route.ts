// app/api/admin/payment-config/[id]/route.ts
import { db } from "@/lib/db";
import { paymentConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { adminPaymentConfigUpdateSchema } from "@/lib/validations"; // ✅ Importar schema
import { z } from "zod"; // ✅ Para manejar ZodError

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    
    // ✅ CRÍTICO - Validar con Zod antes de actualizar
    let validatedData;
    try {
      validatedData = adminPaymentConfigUpdateSchema.parse(body);
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
    const updateData: Record<string, unknown> = {};
    if (validatedData.method !== undefined) updateData.method = validatedData.method;
    if (validatedData.label !== undefined) updateData.label = validatedData.label;
    if (validatedData.icon !== undefined) updateData.icon = validatedData.icon || null;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.bankName !== undefined) updateData.bankName = validatedData.bankName || null;
    if (validatedData.cbu !== undefined) updateData.cbu = validatedData.cbu || null;
    if (validatedData.alias !== undefined) updateData.alias = validatedData.alias || null;
    if (validatedData.titular !== undefined) updateData.titular = validatedData.titular || null;
    if (validatedData.whatsapp !== undefined) updateData.whatsapp = validatedData.whatsapp || null;

    const [updated] = await db
      .update(paymentConfig)
      .set(updateData)
      .where(eq(paymentConfig.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Método no encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return logger.getErrorResponse("api/admin/payment-config PUT", error);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(paymentConfig)
      .where(eq(paymentConfig.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Método no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return logger.getErrorResponse("api/admin/payment-config DELETE", error);
  }
}