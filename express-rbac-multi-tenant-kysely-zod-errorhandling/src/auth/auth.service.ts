import bcrypt from "bcrypt";
import { sign, type SignOptions, type Secret } from "jsonwebtoken";
import type { Role, NewUser, User } from "../../domain/user/user.table";
import { userRepo } from "../user/user.repo.ts";
import { registerSchema, loginSchema } from "../../domain/authentication";

const SALT_ROUNDS = 10;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function signJwt(user: { id: string; role: Role }): string {
  const secret: Secret = process.env.JWT_SECRET || "i-am-an-idiot";
  const options: SignOptions = {
    // ensure correct type narrowing for expiresIn (string like "7d" or number in seconds)
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as unknown as SignOptions["expiresIn"],
  };
  return sign({ sub: user.id, role: user.role }, secret, options);
}

async function registerUser(inputRaw: unknown): Promise<{ user: User; token: string }> {
  const input = registerSchema.parse(inputRaw);
  const password_hash = await hashPassword(input.password);
  const created = await userRepo.insertUser({
    tenant_id: "35bf3157-aa86-42fc-af32-2c602d3b8be2",
    email: input.email,
    password_hash,
    role: input.role as Role,
    created_at: new Date(),
  } as unknown as NewUser);

  const token = signJwt({ id: created.id as unknown as string, role: created.role });
  return { user: created, token };
}

async function login(inputRaw: unknown): Promise<{ user: User; token: string } | null> {
  const input = loginSchema.parse(inputRaw);
  const existing = await userRepo.getUserByEmail(input.email);
  if (!existing) return null;
  const ok = await verifyPassword(input.password, existing.password_hash);
  if (!ok) return null;
  const token = signJwt({ id: existing.id as unknown as string, role: existing.role });
  return { user: existing, token };
}

export const authService = {
  registerUser,
  login,
};
