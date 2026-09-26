import { readFileSync } from "fs";
import { join } from "path";

const envPath = join(__dirname, ".env");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

async function main() {
  const { db } = await import("./src/db/index");
  const { courses } = await import("./src/db/schema");
  const rows = await db.select().from(courses);
  console.log(JSON.stringify(rows, null, 2));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
