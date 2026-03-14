import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const misOrdenes = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  const ordersConItems = await Promise.all(
    misOrdenes.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantityKg: orderItems.quantityKg,
          unitPrice: orderItems.unitPrice,
          priceSnapshot: orderItems.priceSnapshot,
          productName: products.name,
          productImage: products.images,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    })
  );

  return NextResponse.json(ordersConItems);
}