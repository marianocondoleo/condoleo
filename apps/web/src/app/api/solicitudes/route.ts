import { db } from "@/lib/db";
import { solicitudes, products, solicitudFiles } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

    const formData = await req.formData();
console.log("FORM DATA:", {
  productId: formData.get("productId"),
  talle: formData.get("talle"),
  medida: formData.get("medida"),
  tipoMedida: formData.get("tipoMedida"),
});
    const productId = formData.get("productId") as string;
    const talle = formData.get("talle") as string;
    const tipoMedida = formData.get("tipoMedida") as string; 
    const medicoNombre = formData.get("medicoNombre") as string;
    const notas = formData.get("notas") as string;
    const file = formData.get("file") as File | null;

    if (!productId || !talle || !tipoMedida) {
      return Response.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const product = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.id, productId),
    });

    if (!product) {
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    let fileUrl: string | null = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      const filePath = path.join(uploadDir, fileName);
      const fs = await import("fs/promises");
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    }

    const nueva = await db.insert(solicitudes).values({
      userId,
      productId,
      talle,        
      tipoMedida,    
      medicoNombre: medicoNombre || null,
      notas: notas || null,
      precioProducto: product.price,
      precioTotal: product.price,
      status: "solicitud_enviada",
    }).returning();

    if (fileUrl) {
      await db.insert(solicitudFiles).values({
        id: crypto.randomUUID(),
        solicitudId: nueva[0].id,
        url: fileUrl,
        type: file?.name || null,
      });
    }

    return Response.json({ success: true, solicitud: nueva[0] });
  } catch (error) {
    console.error("❌ ERROR API SOLICITUDES:", error);
    return Response.json({ error: "Error interno", detalle: String(error) }, { status: 500 });
  }
}