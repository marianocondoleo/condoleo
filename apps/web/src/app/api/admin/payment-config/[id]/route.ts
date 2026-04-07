// app/api/admin/payment-config/[id]/route.ts
import { db } from "@/lib/db";
import { paymentConfig } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

async function checkAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  return role === "admin";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { method, label, icon, isActive, bankName, cbu, alias, titular, whatsapp } = body;

    const [updated] = await db
      .update(paymentConfig)
      .set({ method, label, icon, isActive, bankName, cbu, alias, titular, whatsapp })
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
  if (!(await checkAdmin())) {
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