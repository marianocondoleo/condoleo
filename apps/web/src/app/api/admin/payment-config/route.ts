// app/api/admin/payment-config/route.ts
import { db } from "@/lib/db";
import { paymentConfig } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  return role === "admin";
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const data = await db.select().from(paymentConfig);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener métodos de pago" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { method, label, icon, isActive, bankName, cbu, alias, titular, whatsapp } = body;

    if (!method || !label) {
      return NextResponse.json({ error: "method y label son requeridos" }, { status: 400 });
    }

    const [created] = await db
      .insert(paymentConfig)
      .values({ method, label, icon, isActive, bankName, cbu, alias, titular, whatsapp })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear método de pago" }, { status: 500 });
  }
}