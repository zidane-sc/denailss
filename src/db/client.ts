import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum dikonfigurasi.");
  client ??= postgres(url, {
    prepare: false,
    // Bound the pool so concurrent requests can't exhaust Supabase's pooler.
    // `idle_timeout` recycles idle connections so queued queries can acquire a
    // slot instead of waiting forever behind a permanently-open pool.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}
