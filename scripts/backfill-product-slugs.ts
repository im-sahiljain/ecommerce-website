import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { db } = await import("../lib/db");
  const changes = await db.backfillProductSlugs();
  console.log(JSON.stringify(changes, null, 2));
  await db.pgPool?.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
