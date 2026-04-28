import "dotenv/config";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); 
import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL no está definida. Revisá tu .env.local");
}

export default {
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/relations.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;