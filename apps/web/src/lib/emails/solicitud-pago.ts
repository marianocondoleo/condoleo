export function emailSolicitudPago({
  pacienteNombre,
  producto,
  precioProducto,
  precioEnvio,
  precioTotal,
  mensaje,
  datosBancarios,
}: {
  pacienteNombre: string;
  producto: string;
  precioProducto: string;
  precioEnvio: string;
  precioTotal: string;
  mensaje?: string;
  datosBancarios: {
    banco: string;
    cbu: string;
    alias: string;
    titular: string;
  };
}) {
  return {
    subject: "Solicitud aprobada — Instrucciones de pago",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #111;">
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 8px;">Condoleo.</h1>
        <div style="width: 40px; height: 1px; background: #ccc; margin-bottom: 32px;"></div>

        <p style="font-size: 15px; line-height: 1.6;">Hola <strong>${pacienteNombre}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Tu solicitud de <strong>${producto}</strong> fue revisada y aprobada.
          Para continuar, realizá la transferencia con el detalle a continuación:
        </p>

        ${mensaje ? `
        <div style="border-left: 2px solid #ccc; padding-left: 16px; margin: 24px 0; color: #555; font-size: 14px;">
          ${mensaje}
        </div>` : ""}

        <!-- Detalle de precios -->
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Detalle</p>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 14px; color: #555;">Producto</span>
            <span style="font-size: 14px;">$${precioProducto}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span style="font-size: 14px; color: #555;">Envío</span>
            <span style="font-size: 14px;">$${precioEnvio}</span>
          </div>
          <div style="border-top: 1px solid #ddd; padding-top: 12px; display: flex; justify-content: space-between;">
            <span style="font-size: 15px; font-weight: bold;">Total a transferir</span>
            <span style="font-size: 15px; font-weight: bold;">$${precioTotal}</span>
          </div>
        </div>

        <!-- Datos bancarios -->
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Datos bancarios</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Banco:</strong> ${datosBancarios.banco}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>CBU:</strong> ${datosBancarios.cbu}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Alias:</strong> ${datosBancarios.alias}</p>
          <p style="margin: 4px 0; font-size: 15px;"><strong>Titular:</strong> ${datosBancarios.titular}</p>
        </div>

        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Una vez realizada la transferencia, enviá el comprobante por email a 
          <a href="mailto:ortopediafoc@gmail.com" style="color: #111;">ortopediafoc@gmail.com</a>.
        </p>

        <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          Precisión · Salud · Confianza
        </div>
      </div>
    `,
  };
}