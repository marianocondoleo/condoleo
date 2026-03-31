import { db } from "@/lib/db";
import { solicitudes, paymentConfig } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/email";
import { emailSolicitudPago } from "@/lib/emails/solicitud-pago";
import { emailSolicitudCancelada } from "@/lib/emails/solicitud-cancelada";

const VALID_STATUSES = [
  "solicitud_enviada",
  "aprobada_pendiente_pago",
  "en_produccion",
  "despachado",
  "recibida",
  "cancelada",
];

const EMAIL_DESTINO = "mdcondoleo@gmail.com"; // ← temporal hasta tener dominio

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin") {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, mensajeCliente, adminNotes, precioEnvio } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return Response.json({ error: "Status inválido" }, { status: 400 });
    }

    const solicitud = await db.query.solicitudes.findFirst({
      where: eq(solicitudes.id, id),
      with: {
        user: true,
        product: true,
      },
    });

    if (!solicitud) {
      return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Calcular total si viene precioEnvio
    const precioEnvioNum = precioEnvio !== undefined ? parseFloat(precioEnvio.toString()) : null;
    const precioTotalCalculado =
      precioEnvioNum !== null
        ? (parseFloat(solicitud.precioProducto || "0") + precioEnvioNum).toFixed(2)
        : undefined;

    const [updated] = await db
      .update(solicitudes)
      .set({
        status,
        updatedAt: new Date(),
        ...(mensajeCliente !== undefined && { mensajeCliente }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(precioEnvioNum !== null && {
          precioEnvio: precioEnvioNum.toFixed(2),
          precioTotal: precioTotalCalculado,
        }),
      })
      .where(eq(solicitudes.id, id))
      .returning();

    const pacienteNombre = `${solicitud.user?.name || ""} ${solicitud.user?.lastName || ""}`.trim() || "Paciente";
    const pacienteEmail = solicitud.user?.email;
    const producto = solicitud.product?.name || "Producto";
    const monto = updated.precioTotal || solicitud.precioTotal || "0"; // ← usa el total actualizado

    // ── Email: Solicitar pago ──────────────────────────────
    if (status === "aprobada_pendiente_pago" && pacienteEmail) {
      const config = await db.query.paymentConfig.findFirst({
        where: eq(paymentConfig.isActive, true),
      });

      if (!config) {
        console.error("No hay configuración de pago activa");
      } else {
        const template = emailSolicitudPago({
          pacienteNombre,
          producto,
          precioProducto: solicitud.precioProducto || "0",
          precioEnvio: precioEnvioNum?.toFixed(2) || "0",
          precioTotal: updated.precioTotal || "0",
          mensaje: mensajeCliente,
          datosBancarios: {
            banco: config.bankName || "",
            cbu: config.cbu || "",
            alias: config.alias || "",
            titular: config.titular || "",
          },
        });

        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: EMAIL_DESTINO,
          subject: template.subject,
          html: template.html,
        });
        console.log("RESEND pago:", JSON.stringify(result));
      }
    }

    // ── Email: Cancelación ────────────────────────────────
    if (status === "cancelada" && pacienteEmail) {
      const template = emailSolicitudCancelada({
        pacienteNombre,
        producto,
        mensaje: mensajeCliente,
      });

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: EMAIL_DESTINO,
        subject: template.subject,
        html: template.html,
      });
      console.log("RESEND cancelación:", JSON.stringify(result));
    }

    return Response.json(updated);
  } catch (error) {
    console.error("ERROR PATCH solicitud:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}