import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const name = process.argv[2];

if (!name) {
    console.error("❌ Please provide a migration name, e.g.:");
    console.error("   bun run migrate:make create_users");
    process.exit(1);
}

const dir = "./migrations";
if (!existsSync(dir)) mkdirSync(dir);

const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

const fileName = `${timestamp}_${name}.ts`;
const filePath = join(dir, fileName);

const template = `import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // TODO: Add migration logic here
}

export async function down(knex: Knex): Promise<void> {
  // TODO: Add rollback logic here
}
`;

writeFileSync(filePath, template);
console.log(`✅ Created migration: ${filePath}`);
