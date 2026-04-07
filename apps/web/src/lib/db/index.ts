import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../env"; // ✅ Importar para validar en startup
import * as schema from "./schema";
import * as relations from "./relations";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema: { ...schema, ...relations } });