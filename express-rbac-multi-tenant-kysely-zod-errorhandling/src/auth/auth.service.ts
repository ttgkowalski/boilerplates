import bcrypt from "bcrypt";
import { sign, type SignOptions, type Secret } from "jsonwebtoken";
import type { NewUser, User } from "../../domain/user/user.table";
import type { Role } from "../../domain/role/role.table";
import { userRepo } from "../user/user.repo";
import { roleRepo } from "../role/role.repo";
import { userRoleRepo } from "../user-role/user-role.repo";
import { registerSchema, loginSchema } from "../../domain/authentication";
import { BadRequestError, UnauthorizedError, InternalServerError } from "../errors";
import { Trace } from "../tracing";

const SALT_ROUNDS = 10;

export class AuthService {
  private async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  private signJwt(user: { id: string; roles: string[]; tenant_id: string | null }): string {
    const secret: Secret = "i-am-an-idiot";
    const options: SignOptions = {
      // ensure correct type narrowing for expiresIn (string like "7d" or number in seconds)
      expiresIn: "7d" as unknown as SignOptions["expiresIn"],
    };
    return sign({ sub: user.id, roles: user.roles, tenant_id: user.tenant_id }, secret, options);
  }

  @Trace({ spanName: "authService.registerUser" })
  async registerUser(inputRaw: unknown): Promise<{ user: User; token: string; roles: Role[] }> {
    try {
      const input = registerSchema.parse(inputRaw);
      const password_hash = await this.hashPassword(input.password);
      const created = await userRepo.insertUser({
        tenant_id: "42a401e2-7d75-4859-8538-000363fe1b26",
        email: input.email,
        password_hash,
        created_at: new Date(),
      } as unknown as NewUser);

      // Atribuir role padrão ao usuário
      const defaultRole = await roleRepo.getRoleByName(input.role || "User");
      if (!defaultRole) {
        throw new InternalServerError("Default role not found");
      }
      await userRoleRepo.assignRoleToUser(created.id as unknown as string, defaultRole.id);

      // Buscar todas as roles do usuário
      const userRoles = await userRoleRepo.getUserRoles(created.id as unknown as string);
      const roleNames = userRoles.map(r => r.name);

      const token = this.signJwt({ 
        id: created.id as unknown as string, 
        roles: roleNames,
        tenant_id: created.tenant_id 
      });
      return { user: created, token, roles: userRoles };
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

  @Trace({ spanName: "authService.login" })
  async login(inputRaw: unknown): Promise<{ user: User; token: string; roles: Role[] }> {
    try {
      const input = loginSchema.parse(inputRaw);
      const existing = await userRepo.getUserByEmail(input.email);
      if (!existing) {
        throw new UnauthorizedError("Invalid credentials");
      }
      const ok = await this.verifyPassword(input.password, existing.password_hash);
      if (!ok) {
        throw new UnauthorizedError("Invalid credentials");
      }
      
      // Buscar todas as roles do usuário
      const userRoles = await userRoleRepo.getUserRoles(existing.id as unknown as string);
      const roleNames = userRoles.map(r => r.name);
      
      const token = this.signJwt({ 
        id: existing.id as unknown as string, 
        roles: roleNames,
        tenant_id: existing.tenant_id 
      });
      return { user: existing, token, roles: userRoles };
    } catch (error: any) {
      if (error.name === "ZodError") {
        throw new BadRequestError("Validation error", { cause: error });
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
