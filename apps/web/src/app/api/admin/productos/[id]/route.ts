// app/api/admin/productos/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function checkAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role;
  return role === "admin";
}

// PUT
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;  // ← await
    const body = await req.json();
    const { name, sku, categoryId, price, description, images, isActive } = body;

    const [updated] = await db
      .update(products)
      .set({ name, sku, categoryId, price, description, images, isActive })
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
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
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
  console.error("ERROR DELETE:", error);
  return NextResponse.json({ error: String(error) }, { status: 500 });
}
}