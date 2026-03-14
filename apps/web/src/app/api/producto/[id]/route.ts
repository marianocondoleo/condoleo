import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      pricePerKg: products.pricePerKg,
      stockKg: products.stockKg,
      origin: products.origin,
      breed: products.breed,
      slaughterDate: products.slaughterDate,
      images: products.images,
      category: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1);

  if (!result[0]) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}