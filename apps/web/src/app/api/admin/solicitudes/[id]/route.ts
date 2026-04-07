import { db } from "@/lib/db";
import { solicitudes, solicitudStatusHistory, paymentConfig } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/email";
import { emailSolicitudPago } from "@/lib/emails/solicitud-pago";
import { emailSolicitudCancelada } from "@/lib/emails/solicitud-cancelada";
import { emailEnProduccion } from "@/lib/emails/solicitud-en-produccion";
import { emailDespachada } from "@/lib/emails/solicitud-despachada";
import { emailRecibida } from "@/lib/emails/solicitud-recibida";
import { actualizarSolicitudStatusSchema, mapearErroresZod } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { z } from "zod";

const VALID_STATUSES = [
  "solicitud_enviada",
  "aprobada_pendiente_pago",
  "en_produccion",
  "despachado",
  "recibida",
  "cancelada",
];

const EMAIL_DESTINO = process.env.ADMIN_EMAIL || "admin@condoleo.com";

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
    });
    logger.info("sendEmail", `Email enviado a ${to}: ${subject}`, { result });
  } catch (error) {
    logger.error("sendEmail", error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { sessionClaims, userId } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin") {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, mensajeCliente, adminNotes, precioEnvio } = body;

    // Validar con Zod (solo campos que se envíen)
    try {
      actualizarSolicitudStatusSchema.parse({ 
        status, 
        precioEnvio: precioEnvio !== undefined ? precioEnvio.toString() : undefined,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errores = mapearErroresZod(validationError);
        return Response.json(
          { error: "Validación fallida", errors: errores },
          { status: 400 }
        );
      }
      throw validationError;
    }

    const solicitud = await db.query.solicitudes.findFirst({
      where: eq(solicitudes.id, id),
      with: { user: true, product: true },
    });

    if (!solicitud) {
      return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    const precioEnvioNum = precioEnvio !== undefined && precioEnvio !== "" ? parseFloat(precioEnvio.toString()) : null;
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

    // Registrar en historial de auditoría
    if (userId) {
      await db.insert(solicitudStatusHistory).values({
        solicitudId: id,
        status,
        changedBy: userId,
      });
    }

    const pacienteNombre = `${solicitud.user?.name || ""} ${solicitud.user?.lastName || ""}`.trim() || "Paciente";
    const pacienteEmail = solicitud.user?.email;
    const producto = solicitud.product?.name || "Producto";

    if (!pacienteEmail) {
      return Response.json(updated);
    }

    // ── Email: Solicitar pago ──────────────────────────────
    if (status === "aprobada_pendiente_pago") {
      const config = await db.query.paymentConfig.findFirst({
        where: eq(paymentConfig.isActive, true),
      });

      if (!config) {
        logger.warn("sendEmail", "No hay configuración de pago activa");
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
        await sendEmail(pacienteEmail, template.subject, template.html);
      }
    }

    // ── Email: En producción ───────────────────────────────
    if (status === "en_produccion") {
      const template = emailEnProduccion({ pacienteNombre, producto, mensaje: mensajeCliente });
      await sendEmail(pacienteEmail, template.subject, template.html);
    }

    // ── Email: Despachado ──────────────────────────────────
    if (status === "despachado") {
      const template = emailDespachada({ pacienteNombre, producto, mensaje: mensajeCliente });
      await sendEmail(pacienteEmail, template.subject, template.html);
    }

    // ── Email: Recibida ────────────────────────────────────
    if (status === "recibida") {
      const template = emailRecibida({ pacienteNombre, producto, mensaje: mensajeCliente });
      await sendEmail(pacienteEmail, template.subject, template.html);
    }

    // ── Email: Cancelación ─────────────────────────────────
    if (status === "cancelada") {
      const template = emailSolicitudCancelada({ pacienteNombre, producto, mensaje: mensajeCliente });
      await sendEmail(pacienteEmail, template.subject, template.html);
    }

    logger.info(
      "admin/solicitudes PATCH",
      `Solicitud actualizada: ${id}`,
      { status, usuario: userId }
    );

    return Response.json(updated);
  } catch (error) {
    return logger.getErrorResponse("api/admin/solicitudes PATCH", error);
  }
}