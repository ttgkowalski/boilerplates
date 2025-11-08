import { db } from "../db";
import type { UserRole, NewUserRole } from "../../domain/user-role/user-role.table";
import type { Role } from "../../domain/role/role.table";
import { NotFoundError, InternalServerError } from "../errors";
import { Trace } from "../tracing";

export class UserRoleRepo {
  @Trace({ spanName: "userRoleRepo.assignRoleToUser" })
  async assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
    try {
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
      
      if (!row) {
        throw new InternalServerError("Failed to assign role to user");
      }
      
      return row;
    } catch (error: any) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      throw new InternalServerError("Failed to assign role to user", { cause: error });
    }
  }

  @Trace({ spanName: "userRoleRepo.getUserRoles" })
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      return await db
        .selectFrom("user_roles")
        .innerJoin("roles", "user_roles.role_id", "roles.id")
        .selectAll("roles")
        .where("user_roles.user_id", "=", userId)
        .execute();
    } catch (error: any) {
      throw new InternalServerError("Failed to get user roles", { cause: error });
    }
  }

  @Trace({ spanName: "userRoleRepo.removeRoleFromUser" })
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await db
        .deleteFrom("user_roles")
        .where("user_id", "=", userId)
        .where("role_id", "=", roleId)
        .execute();
    } catch (error: any) {
      throw new InternalServerError("Failed to remove role from user", { cause: error });
    }
  }

  @Trace({ spanName: "userRoleRepo.removeAllRolesFromUser" })
  async removeAllRolesFromUser(userId: string): Promise<void> {
    try {
      await db.deleteFrom("user_roles").where("user_id", "=", userId).execute();
    } catch (error: any) {
      throw new InternalServerError("Failed to remove all roles from user", { cause: error });
    }
  }
}

export const userRoleRepo = new UserRoleRepo();
