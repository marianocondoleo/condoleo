// src/app/api/users/[userId]/route.ts
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { userId: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { userId } = params;

  try {
    const user = await db.query.users.findFirst({
      where: (u) => u.id.eq(userId),
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role, // 🔹 Asegúrate que esto exista en Neon
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno", details: String(error) }, { status: 500 });
  }
}