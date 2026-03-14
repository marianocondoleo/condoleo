import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";

export async function POST(req: Request) {
  const body = await req.json();

  if (body.type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

  const payment = new Payment(client);
  const paymentData = await payment.get({ id: body.data.id });

  const orderId = paymentData.external_reference;
  const status = paymentData.status;

  if (!orderId) return NextResponse.json({ ok: true });

  if (status === "approved") {
    await db.update(orders)
      .set({ status: "confirmed", mpPaymentId: String(paymentData.id) })
      .where(eq(orders.id, orderId));
  }

  return NextResponse.json({ ok: true });
}