import { db } from "../db";
import type { UserRole, NewUserRole } from "../../domain/user-role/user-role.table";
import type { Role } from "../../domain/role/role.table";

async function assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
  // Verificar se já existe antes de inserir
  const existing = await db
    .selectFrom("user_roles")
    .selectAll()
    .where("user_id", "=", userId)
    .where("role_id", "=", roleId)
    .executeTakeFirst();
  
  if (existing) {
    return existing;
  }
  
  // Inserir se não existir
  const row = await db
    .insertInto("user_roles")
    .values({
      user_id: userId,
      role_id: roleId,
      created_at: new Date(),
    })
    .returningAll()
    .executeTakeFirst();
  
  return row!;
}

async function getUserRoles(userId: string): Promise<Role[]> {
  return db
    .selectFrom("user_roles")
    .innerJoin("roles", "user_roles.role_id", "roles.id")
    .selectAll("roles")
    .where("user_roles.user_id", "=", userId)
    .execute();
}

async function removeRoleFromUser(userId: string, roleId: string): Promise<void> {
  await db
    .deleteFrom("user_roles")
    .where("user_id", "=", userId)
    .where("role_id", "=", roleId)
    .execute();
}

async function removeAllRolesFromUser(userId: string): Promise<void> {
  await db.deleteFrom("user_roles").where("user_id", "=", userId).execute();
}

export const userRoleRepo = {
  assignRoleToUser,
  getUserRoles,
  removeRoleFromUser,
  removeAllRolesFromUser,
};

