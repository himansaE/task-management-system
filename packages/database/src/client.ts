import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

export function createDatabaseClient(connectionString: string) {
  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool, { schema });

  return { db, pool };
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>["db"];
