import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, orderItems, users, addresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { items, deliveryDate, deliverySlot, notes, metodoPago } = body;

  if (!items?.length || !deliveryDate || !deliverySlot || !metodoPago) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const address = await db.select().from(addresses).where(eq(addresses.userId, userId)).limit(1);

  if (!user[0]?.phone || !user[0]?.dni || !address[0]?.street) {
    return NextResponse.json({ error: "Perfil incompleto" }, { status: 400 });
  }

  const total = items.reduce((acc: number, item: any) => {
    return acc + Number(item.pricePerKg) * Number(item.cantidad);
  }, 0);

  // Determinar status inicial según método de pago
  const statusInicial =
    metodoPago === "efectivo" ? "confirmed" :
    metodoPago === "transferencia" ? "pending" :
    "pending"; // mercadopago y tarjeta quedan pending hasta acreditación

  const [order] = await db.insert(orders).values({
    userId,
    total: total.toFixed(2),
    deliveryDate: new Date(deliveryDate),
    deliverySlot,
    notes: notes ?? null,
    metodoPago,
    status: statusInicial,
  }).returning();

  await db.insert(orderItems).values(
    items.map((item: any) => ({
      orderId: order.id,
      productId: item.id,
      quantityKg: Number(item.cantidad).toFixed(3),
      priceSnapshot: Number(item.pricePerKg).toFixed(2),
      unitPrice: Number(item.pricePerKg).toFixed(2),
    }))
  );

  // Efectivo y transferencia — devolver orderId directo
  if (metodoPago === "efectivo" || metodoPago === "transferencia") {
    return NextResponse.json({ ok: true, orderId: order.id, redirect: null });
  }

  // MercadoPago y tarjeta — crear preferencia de pago
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

  const preference = new Preference(client);

  const prefData = await preference.create({
    body: {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.name,
        quantity: 1,
        unit_price: Number((Number(item.pricePerKg) * Number(item.cantidad)).toFixed(2)),
        currency_id: "ARS",
      })),
      external_reference: order.id,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/pedido/${order.id}?status=success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/pedido/${order.id}?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pedido/${order.id}?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
    },
  });

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    redirect: prefData.init_point,
  });
}