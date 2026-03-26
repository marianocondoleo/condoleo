import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { solicitudes, solicitudStatusHistory, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  return NextResponse.json({ status: "API solicitudes OK" });
}
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      productId,
      talle,
      pie,
      medicoNombre,
      notas,
    } = body;

    // Validación básica
    if (!productId || !talle || !pie) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Buscar producto (para congelar precio)
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Crear solicitud
    const [solicitud] = await db
      .insert(solicitudes)
      .values({
        userId,
        productId,
        status: "submitted",
        talle,
        pie,
        medicoNombre,
        notas,
        precioProducto: product.price,
        precioTotal: product.price, // envío después
      })
      .returning();

    // Crear historial
    await db.insert(solicitudStatusHistory).values({
      solicitudId: solicitud.id,
      status: "submitted",
      changedBy: userId,
    });

    return NextResponse.json({
      success: true,
      solicitud,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error creando solicitud" },
      { status: 500 }
    );
  }
}