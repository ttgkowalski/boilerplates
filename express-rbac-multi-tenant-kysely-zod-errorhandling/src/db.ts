import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { TenantTable } from "../domain/tenant/tenant.table";
import type { UserTable } from "../domain/user/user.table";
import type { RoleTable } from "../domain/role/role.table";
import type { UserRoleTable } from "../domain/user-role/user-role.table";

export interface Database {
  tenants: TenantTable;
  users: UserTable;
  roles: RoleTable;
  user_roles: UserRoleTable;
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
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


