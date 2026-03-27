// app/api/admin/productos/route.ts
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

// GET /api/admin/productos
export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await db.select().from(products).orderBy(products.createdAt);
    return NextResponse.json(data);
  } catch (error) {
    console.error("ERROR PRODUCTOS:", JSON.stringify(error, null, 2)); // ← cambiá esta línea
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

// POST /api/admin/productos
export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, sku, categoryId, price, description, images, isActive } = body;

    if (!name || !sku || !price) {
      return NextResponse.json({ error: "name, sku y price son requeridos" }, { status: 400 });
    }

    const [producto] = await db
      .insert(products)
      .values({ name, sku, categoryId, price, description, images, isActive })
      .returning();

    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "El SKU ya existe" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}