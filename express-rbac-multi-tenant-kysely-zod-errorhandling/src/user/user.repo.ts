import { db } from "../db";
import type { User, NewUser, UserUpdate } from "../../domain/user/user.table";
import { NotFoundError, BadRequestError, InternalServerError } from "../errors";
import { Trace } from "../tracing";

export class UserRepo {
  @Trace({ spanName: "userRepo.insertUser" })
  async insertUser(input: NewUser): Promise<User> {
    try {
      const row = await db.insertInto("users").values(input).returningAll().executeTakeFirst();
      if (!row) {
        throw new InternalServerError("Failed to create user");
      }
      return row;
    } catch (error: any) {
      if (error.code === "23505") { // PostgreSQL unique violation
        throw new BadRequestError("Email already exists", { cause: error });
      }
      throw new InternalServerError("Failed to create user", { cause: error });
    }
  }

  @Trace({ spanName: "userRepo.listUsers" })
  async listUsers(): Promise<User[]> {
    try {
      return await db.selectFrom("users").selectAll().execute();
    } catch (error: any) {
      throw new InternalServerError("Failed to list users", { cause: error });
    }
  }

  @Trace({ spanName: "userRepo.getUser" })
  async getUser(id: string): Promise<User> {
    try {
      const user = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
      if (!user) {
        throw new NotFoundError("User");
      }
      return user;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Failed to get user", { cause: error });
    }
  }

  @Trace({ spanName: "userRepo.updateUser" })
  async updateUser(id: string, input: UserUpdate): Promise<User> {
    try {
      const updated = await db.updateTable("users").set(input).where("id", "=", id).returningAll().executeTakeFirst();
      if (!updated) {
        throw new NotFoundError("User");
      }
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error.code === "23505") { // PostgreSQL unique violation
        throw new BadRequestError("Email already exists", { cause: error });
      }
      throw new InternalServerError("Failed to update user", { cause: error });
    }
  }

  @Trace({ spanName: "userRepo.deleteUser" })
  async deleteUser(id: string): Promise<void> {
    try {
      const deleted = await db.deleteFrom("users").where("id", "=", id).returningAll().executeTakeFirst();
      if (!deleted) {
        throw new NotFoundError("User");
      }
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError("Failed to delete user", { cause: error });
    }
  }

  @Trace({ spanName: "userRepo.getUserByEmail" })
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await db.selectFrom("users").selectAll().where("email", "=", email).executeTakeFirst();
    } catch (error: any) {
      throw new InternalServerError("Failed to get user by email", { cause: error });
    }
  }
}

export const userRepo = new UserRepo();
