export function emailSolicitudCancelada({
  pacienteNombre,
  producto,
  mensaje,
}: {
  pacienteNombre: string;
  producto: string;
  mensaje?: string;
}) {
  return {
    subject: "Actualización sobre tu solicitud — Condoleo",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 8px;">Condoleo.</h1>
        <div style="width: 40px; height: 1px; background: #ccc; margin-bottom: 32px;"></div>

        <p style="font-size: 15px; line-height: 1.6;">Hola <strong>${pacienteNombre}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Tu solicitud de <strong>${producto}</strong> no pudo ser procesada en esta oportunidad.
        </p>

        ${mensaje ? `
        <div style="border-left: 2px solid #ccc; padding-left: 16px; margin: 24px 0; color: #555; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Mensaje del equipo</p>
          ${mensaje}
        </div>` : ""}

        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Si tenés dudas podés contactarnos respondiendo este mail.
        </p>

        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          Precisión · Salud · Confianza
        </div>
      </div>
    `,
  };
}