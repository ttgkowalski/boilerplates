import bcrypt from "bcrypt";
import { sign, type SignOptions, type Secret } from "jsonwebtoken";
import type { NewUser, User } from "../../domain/user/user.table";
import type { Role } from "../../domain/role/role.table";
import { userRepo } from "../user/user.repo";
import { roleRepo } from "../role/role.repo";
import { userRoleRepo } from "../user-role/user-role.repo";
import { registerSchema, loginSchema } from "../../domain/authentication";
import { BadRequestError, UnauthorizedError, InternalServerError } from "../errors";

const SALT_ROUNDS = 10;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function signJwt(user: { id: string; roles: string[] }): string {
  const secret: Secret = process.env.JWT_SECRET || "i-am-an-idiot";
  const options: SignOptions = {
    // ensure correct type narrowing for expiresIn (string like "7d" or number in seconds)
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as unknown as SignOptions["expiresIn"],
  };
  return sign({ sub: user.id, roles: user.roles }, secret, options);
}

async function registerUser(inputRaw: unknown): Promise<{ user: User; token: string; roles: Role[] }> {
  try {
    const input = registerSchema.parse(inputRaw);
    const password_hash = await hashPassword(input.password);
    const created = await userRepo.insertUser({
      tenant_id: "35bf3157-aa86-42fc-af32-2c602d3b8be2",
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

    const token = signJwt({ id: created.id as unknown as string, roles: roleNames });
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

async function login(inputRaw: unknown): Promise<{ user: User; token: string; roles: Role[] }> {
  try {
    const input = loginSchema.parse(inputRaw);
    const existing = await userRepo.getUserByEmail(input.email);
    if (!existing) {
      throw new UnauthorizedError("Invalid credentials");
    }
    const ok = await verifyPassword(input.password, existing.password_hash);
    if (!ok) {
      throw new UnauthorizedError("Invalid credentials");
    }
    
    // Buscar todas as roles do usuário
    const userRoles = await userRoleRepo.getUserRoles(existing.id as unknown as string);
    const roleNames = userRoles.map(r => r.name);
    
    const token = signJwt({ id: existing.id as unknown as string, roles: roleNames });
    return { user: existing, token, roles: userRoles };
  } catch (error: any) {
    if (error.name === "ZodError") {
      throw new BadRequestError("Validation error", { cause: error });
    }
    throw error;
  }
}

export const authService = {
  registerUser,
  login,
};
