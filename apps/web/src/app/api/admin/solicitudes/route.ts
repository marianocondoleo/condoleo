import { db } from "@/lib/db";
import { solicitudes } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { sessionClaims } = await auth();
const role = (sessionClaims?.metadata as any)?.role;
if (role !== "admin") return Response.json({ error: "No autorizado" }, { status: 401 });

    const data = await db.query.solicitudes.findMany({
      with: {
        product: true,
        user: {
          with: {
            addresses: true, // <-- traemos direcciones relacionadas del usuario
          },
        },
        files: true,
      },
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });

    // 🔹 Mapeo seguro: agregamos last_name explícitamente
    const mapped = data.map((s) => ({
      ...s,
      user: {
        ...s.user,
        last_name: s.user?.lastName || "",
      },
    }));

    return Response.json(mapped);
  } catch (error) {
    return Response.json({ error: "Error", details: String(error) }, { status: 500 });
  }
}