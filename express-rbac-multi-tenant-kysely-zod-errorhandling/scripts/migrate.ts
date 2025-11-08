import Knex from "knex";
import config from "../knexfile";

type Env = keyof typeof config;

const envArg = process.argv.find((a) => a.startsWith("--env="));
const env = (envArg ? envArg.split("=")[1] : process.env.NODE_ENV || "development") as Env;

if (!config[env]) {
  throw new Error(`❌ Invalid environment "${String(env)}". Expected one of: ${Object.keys(config).join(", ")}`);
}

const knex = Knex(config[env]);

const [, , command, param] = process.argv;

async function main() {
  switch (command) {
    case "latest":
      await knex.migrate.latest();
      console.log(`✅ Migrations applied (${String(env)})`);
      break;

    case "rollback":
      if (process.argv.includes("--all")) {
        await knex.migrate.rollback(undefined, true);
        console.log(`↩️  All migrations rolled back (${String(env)})`);
      } else {
        await knex.migrate.rollback();
        console.log(`↩️  Last migration batch rolled back (${String(env)})`);
      }
      break;

    case "up":
      if (param) {
        await knex.migrate.up({ name: param });
        console.log(`⬆️  Migration "${param}" applied (${String(env)})`);
      } else {
        await knex.migrate.up();
        console.log(`⬆️  Next pending migration applied (${String(env)})`);
      }
      break;

    case "down":
      if (param) {
        await knex.migrate.down({ name: param });
        console.log(`⬇️  Migration "${param}" reverted (${String(env)})`);
      } else {
        await knex.migrate.down();
        console.log(`⬇️  Last migration reverted (${String(env)})`);
      }
      break;

    case "list": {
      const [completed, pending] = await knex.migrate.list();
      console.log("✅ Completed migrations:");
      console.log(completed.map((m: any) => `  - ${m.file}`).join("\n") || "  (none)");
      console.log("\n🕓 Pending migrations:");
      console.log(pending.map((m: any) => `  - ${m.file}`).join("\n") || "  (none)");
      break;
    }

    default:
      console.log(`
Usage:
  bun run migrate <command> [options]

Commands:
  latest                 Run all pending migrations
  rollback [--all]       Rollback last batch or all migrations
  up [file]              Run next or specific migration
  down [file]            Undo last or specific migration
  list                   Show completed and pending migrations

Options:
  --env=<environment>    Select environment (default: development)
`);
  }
}

main()
  .catch((err) => console.error("❌ Migration error:", err))
  .finally(async () => {
    await knex.destroy();
  });
