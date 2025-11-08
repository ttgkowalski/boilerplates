import bcrypt from "bcrypt";
import { userRepo } from "./user.repo";
import { roleRepo } from "../role/role.repo";
import { userRoleRepo } from "../user-role/user-role.repo";
import { createUserSchema, updateUserSchema } from "../../domain/user";
import type { NewUser, User, UserUpdate } from "../../domain/user/user.table";
import { BadRequestError, InternalServerError } from "../errors";
import { Trace } from "../tracing";

const SALT_ROUNDS = 10;

export class UserService {
  private async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  @Trace({ spanName: "userService.create" })
  async create(inputRaw: unknown): Promise<User> {
    try {
      const input = createUserSchema.parse(inputRaw);
      const password_hash = await this.hashPassword(input.password);
      
      const newUser: NewUser = {
        tenant_id: input.tenant_id || "42a401e2-7d75-4859-8538-000363fe1b26",
        email: input.email,
        password_hash,
        created_at: input.created_at || new Date(),
      };

      const created = await userRepo.insertUser(newUser);

      // Atribuir role ao usuário
      const roleName = input.role || "User";
      const role = await roleRepo.getRoleByName(roleName);
      if (!role) {
        throw new InternalServerError(`Role ${roleName} not found`);
      }
      await userRoleRepo.assignRoleToUser(created.id as unknown as string, role.id);

      return created;
    } catch (error: any) {
      if (error.name === "ZodError") {
        throw new BadRequestError("Validation error", { cause: error });
      }
      if (error.code === "23505") { // PostgreSQL unique violation
        throw new BadRequestError("Email already exists", { cause: error });
      }
      throw error;
    }
  }

  @Trace({ spanName: "userService.list" })
  async list(): Promise<User[]> {
    return await userRepo.listUsers();
  }

  @Trace({ spanName: "userService.get" })
  async get(id: string): Promise<User> {
    return await userRepo.getUser(id);
  }

  @Trace({ spanName: "userService.update" })
  async update(id: string, inputRaw: unknown): Promise<User> {
    try {
      const input = updateUserSchema.parse(inputRaw);
      const updateData: UserUpdate = {};

      if (input.email !== undefined) {
        updateData.email = input.email;
      }
      if (input.password !== undefined) {
        updateData.password_hash = await this.hashPassword(input.password);
      }
      if (input.tenant_id !== undefined) {
        updateData.tenant_id = input.tenant_id;
      }

      return await userRepo.updateUser(id, updateData);
    } catch (error: any) {
      if (error.name === "ZodError") {
        throw new BadRequestError("Validation error", { cause: error });
      }
      if (error.code === "23505") { // PostgreSQL unique violation
        throw new BadRequestError("Email already exists", { cause: error });
      }
      throw error;
    }
  }

  @Trace({ spanName: "userService.remove" })
  async remove(id: string): Promise<void> {
    return await userRepo.deleteUser(id);
  }
}

export const userService = new UserService();
