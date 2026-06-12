import { escapeHtml } from "./utils";

export function emailAdminUsuarioNuevo({
  email,
  nombre,
  apellido,
  telefono,
}: {
  email: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
}) {
  return {
    subject: "✨ Nuevo usuario registrado en Condoleo",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 8px;">Condoleo.</h1>
        <div style="width: 40px; height: 1px; background: #ccc; margin-bottom: 32px;"></div>

        <p style="font-size: 15px; line-height: 1.6;">Se ha registrado un nuevo usuario en la plataforma.</p>

        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Datos del usuario</p>
          
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Email</p>
            <p style="margin: 0; font-size: 14px; font-weight: bold;">${escapeHtml(email)}</p>
          </div>

          ${nombre ? `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Nombre</p>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(nombre)}</p>
          </div>
          ` : ''}

          ${apellido ? `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Apellido</p>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(apellido)}</p>
          </div>
          ` : ''}

          ${telefono ? `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Teléfono</p>
            <p style="margin: 0; font-size: 14px;">${escapeHtml(telefono)}</p>
          </div>
          ` : ''}
        </div>

        <p style="font-size: 13px; color: #888; margin-top: 24px;">Este es un mensaje automático de Condoleo.</p>
      </div>
    `,
  };
}
