import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export async function GET() {
  const data = await db.query.products.findMany();
  return Response.json(data);
}