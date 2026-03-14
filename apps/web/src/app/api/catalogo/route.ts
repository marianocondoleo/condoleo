import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("categoria");

  if (slug) {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        pricePerKg: products.pricePerKg,
        stockKg: products.stockKg,
        origin: products.origin,
        images: products.images,
        category: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(categories.slug, slug));

    return NextResponse.json(result);
  }

  const result = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      pricePerKg: products.pricePerKg,
      stockKg: products.stockKg,
      origin: products.origin,
      images: products.images,
      category: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true));

  return NextResponse.json(result);
}