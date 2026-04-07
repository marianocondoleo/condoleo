import { Resend } from "resend";
import { env } from "./env"; // ✅ Importar para validar en startup

export const resend = new Resend(env.RESEND_API_KEY);