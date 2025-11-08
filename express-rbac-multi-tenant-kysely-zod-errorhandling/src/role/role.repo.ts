import { db } from "../db";
import type { Role, NewRole, RoleUpdate } from "../../domain/role/role.table";
import { NotFoundError, BadRequestError, InternalServerError } from "../errors";
import { Trace } from "../tracing";

export class RoleRepo {
  @Trace({ spanName: "roleRepo.insertRole" })
  async insertRole(input: NewRole): Promise<Role> {
    try {
      const row = await db.insertInto("roles").values(input).returningAll().executeTakeFirst();
      if (!row) {
        throw new InternalServerError("Failed to create role");
      }
      return row;
    } catch (error: any) {
      if (error.code === "23505") { // PostgreSQL unique violation
        throw new BadRequestError("Role name already exists", { cause: error });
      }
      throw new InternalServerError("Failed to create role", { cause: error });
    }
  }

  @Trace({ spanName: "roleRepo.listRoles" })
  async listRoles(): Promise<Role[]> {
    try {
      return await db.selectFrom("roles").selectAll().execute();
    } catch (error: any) {
      throw new InternalServerError("Failed to list roles", { cause: error });
    }
  }

  @Trace({ spanName: "roleRepo.getRole" })
  async getRole(id: string): Promise<Role> {
    try {
      const role = await db.selectFrom("roles").selectAll().where("id", "=", id).executeTakeFirst();
      if (!role) {
        throw new NotFoundError("Role");
      }
      return role;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Failed to get role", { cause: error });
    }
  }

  @Trace({ spanName: "roleRepo.getRoleByName" })
  async getRoleByName(name: string): Promise<Role | undefined> {
    try {
      return await db.selectFrom("roles").selectAll().where("name", "=", name).executeTakeFirst();
    } catch (error: any) {
      throw new InternalServerError("Failed to get role by name", { cause: error });
    }
  }

  @Trace({ spanName: "roleRepo.updateRole" })
  async updateRole(id: string, input: RoleUpdate): Promise<Role> {
    try {
      const updated = await db.updateTable("roles").set(input).where("id", "=", id).returningAll().executeTakeFirst();
      if (!updated) {
        throw new NotFoundError("Role");
      }
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error.code === "23505") { // PostgreSQL unique violation
        throw new BadRequestError("Role name already exists", { cause: error });
      }
      throw new InternalServerError("Failed to update role", { cause: error });
    }
  }

  @Trace({ spanName: "roleRepo.deleteRole" })
  async deleteRole(id: string): Promise<void> {
    try {
      const deleted = await db.deleteFrom("roles").where("id", "=", id).returningAll().executeTakeFirst();
      if (!deleted) {
        throw new NotFoundError("Role");
      }
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Failed to delete role", { cause: error });
    }
  }
}

export const roleRepo = new RoleRepo();
