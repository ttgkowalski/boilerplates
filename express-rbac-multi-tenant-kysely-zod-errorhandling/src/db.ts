import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { TenantTable } from "../domain/tenant/tenant.table";
import type { UserTable } from "../domain/user/user.table";

export interface Database {
  tenants: TenantTable;
  users: UserTable;
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: `${process.env.PROJECT_NAME}_${process.env.ENVIRONMENT}`,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export async function destroyDb(): Promise<void> {
  await pool.end();
}


