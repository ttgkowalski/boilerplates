import { DummyDriver, Kysely, PostgresAdapter, PostgresDialect, PostgresIntrospector, PostgresQueryCompiler } from 'kysely'
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

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})

export const queryBuilder = new Kysely<Database>({
  dialect: {
    createAdapter: () => new PostgresAdapter(),
    createDriver: () => new DummyDriver(),
    createIntrospector: (db) => new PostgresIntrospector(db),
    createQueryCompiler: () => new PostgresQueryCompiler(),
  },
})