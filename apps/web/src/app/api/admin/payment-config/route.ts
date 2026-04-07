// app/api/admin/payment-config/route.ts
import { db } from "@/lib/db";
import { paymentConfig } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { adminPaymentConfigSchema } from "@/lib/validations"; // ✅ Importar schema
import { z } from "zod"; // ✅ Para manejar ZodError
import { checkRateLimit } from "@/lib/rateLimit"; // ✅ Rate limiting

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const data = await db.select().from(paymentConfig);
    return NextResponse.json(data);
  } catch (error) {
    return logger.getErrorResponse("api/admin/payment-config GET", error);
  }
}

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
      validatedData = adminPaymentConfigSchema.parse(body);
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

    const [created] = await db
      .insert(paymentConfig)
      .values({
        method: validatedData.method,
        label: validatedData.label,
        icon: validatedData.icon || null,
        isActive: validatedData.isActive,
        bankName: validatedData.bankName || null,
        cbu: validatedData.cbu || null,
        alias: validatedData.alias || null,
        titular: validatedData.titular || null,
        whatsapp: validatedData.whatsapp || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return logger.getErrorResponse("api/admin/payment-config POST", error);
  }
}