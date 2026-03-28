import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { products } from "@/lib/db/schema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

  const data = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.isActive, true),
    columns: {
      id: true,
      name: true,
      price: true,
    },
  });
  return Response.json(data);
}
