import { escapeHtml } from "./utils";

export function emailAdminSolicitudNueva({
  solicitudId,
  pacienteNombre,
  pacienteEmail,
  producto,
  talle,
  tipoMedida,
  medicoNombre,
  notas,
}: {
  solicitudId: string;
  pacienteNombre: string;
  pacienteEmail: string;
  producto: string;
  talle: string;
  tipoMedida: string;
  medicoNombre: string | null;
  notas: string | null;
}) {
  return {
    subject: `📋 Nueva solicitud recibida - ID: ${solicitudId.slice(0, 8)}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 8px;">Condoleo.</h1>
        <div style="width: 40px; height: 1px; background: #ccc; margin-bottom: 32px;"></div>

        <p style="font-size: 15px; line-height: 1.6;">Se ha recibido una nueva solicitud que requiere tu atención.</p>

        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Datos de la solicitud</p>
          
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">ID Solicitud</p>
            <p style="margin: 0; font-size: 14px; font-weight: bold; font-family: monospace;">${escapeHtml(solicitudId)}</p>
          </div>

          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Paciente</p>
            <p style="margin: 0; font-size: 14px; font-weight: bold;">${escapeHtml(pacienteNombre)}</p>
            <p style="margin: 0; font-size: 13px; color: #555;">${escapeHtml(pacienteEmail)}</p>
          </div>

          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Producto</p>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(producto)}</p>
          </div>

          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Talle</p>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(talle)}</p>
          </div>

          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Tipo de medida</p>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(tipoMedida)}</p>
          </div>

          ${medicoNombre ? `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Médico</p>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(medicoNombre)}</p>
          </div>
          ` : ''}

          ${notas ? `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Notas</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(notas)}</p>
          </div>
          ` : ''}
        </div>

        <p style="font-size: 13px; color: #888; margin-top: 24px;">Accede al panel de administración para revisar y procesar esta solicitud.</p>
      </div>
    `,
  };
}
