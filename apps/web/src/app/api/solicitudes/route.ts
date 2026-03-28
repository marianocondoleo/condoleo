import { db } from "@/lib/db";
import { solicitudes, solicitudFiles, users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { uploadFile } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "No autorizado" }, { status: 401 });

    // Verificar que el usuario existe en la DB y tiene perfil completo
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
      with: { addresses: true },
    });

    if (!user) {
      return Response.json({
        error: "Debes completar tu perfil antes de enviar una solicitud.",
      }, { status: 403 });
    }

    if (!user.name || !user.lastName || !user.phone) {
      return Response.json({
        error: "Debés completar tu perfil (nombre, apellido y teléfono) antes de realizar una solicitud.",
      }, { status: 403 });
    }

    if (!user.addresses || user.addresses.length === 0) {
      return Response.json({
        error: "Debés agregar una dirección de entrega en tu perfil antes de realizar una solicitud.",
      }, { status: 403 });
    }

    const formData = await req.formData();

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
      fileUrl = await uploadFile(buffer, file.name, "condoleo/ordenes-medicas");
    }

    const [nueva] = await db.insert(solicitudes).values({
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
        solicitudId: nueva.id,
        url: fileUrl,
        type: file?.name || null,
      });
    }

    return Response.json({ success: true, solicitud: nueva });
  } catch (error) {
    console.error("❌ ERROR API SOLICITUDES:", error);
    return Response.json({ error: "Error interno", detalle: String(error) }, { status: 500 });
  }
}