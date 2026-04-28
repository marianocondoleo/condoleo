import { db } from "@/lib/db";

export async function GET() {
  const data = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.isActive, true),
    columns: {
      id: true,
      name: true,
      description: true,
      images: true,
    },
  });
  return Response.json(data);
}