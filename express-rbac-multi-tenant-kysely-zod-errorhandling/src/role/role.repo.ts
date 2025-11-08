import { db } from "../db";
import type { Role, NewRole, RoleUpdate } from "../../domain/role/role.table";

async function insertRole(input: NewRole): Promise<Role> {
  const row = await db.insertInto("roles").values(input).returningAll().executeTakeFirst();
  return row!;
}

async function listRoles(): Promise<Role[]> {
  return db.selectFrom("roles").selectAll().execute();
}

async function getRole(id: string): Promise<Role | undefined> {
  return db.selectFrom("roles").selectAll().where("id", "=", id).executeTakeFirst();
}

async function getRoleByName(name: string): Promise<Role | undefined> {
  return db.selectFrom("roles").selectAll().where("name", "=", name).executeTakeFirst();
}

async function updateRole(id: string, input: RoleUpdate): Promise<Role | null> {
  const updated = await db.updateTable("roles").set(input).where("id", "=", id).returningAll().executeTakeFirst();
  return updated ?? null;
}

async function deleteRole(id: string): Promise<void> {
  await db.deleteFrom("roles").where("id", "=", id).executeTakeFirst();
}

export const roleRepo = {
  insertRole,
  listRoles,
  getRole,
  getRoleByName,
  updateRole,
  deleteRole,
};

