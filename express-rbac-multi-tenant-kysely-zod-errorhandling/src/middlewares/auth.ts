import type { Request, Response, NextFunction } from "express";
import type { Role } from "../../domain/user/user.table";
import { verify } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export function attachAuth(req: Request, _res: Response, next: NextFunction) {
  // Extracts Bearer token if it exists and attaches it to req.auth
  const authz = String(req.headers["authorization"] || "");
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";

  if (!token) {
    console.log("❌ No token found");
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const payload = verify(token, secret) as { sub: string; role: Role };
    req.auth = { userId: payload.sub, role: payload.role };
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    // invalid token: continue without auth; downstream middlewares may require role
  }
  next();
}

export function requireRole(minRole: Role | Role[]) {
  const order: Record<Role, number> = { Admin: 3, Manager: 2, User: 1 };
  const rolesList = Array.isArray(minRole) ? minRole : [minRole];
  const minRank = Math.max(...rolesList.map((r) => order[r]));

  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.auth?.role || "User";
    const userRank = order[role];

    if (userRank >= minRank) {
      return next();
    }
    
    return res.status(403).json({ error: "Forbidden" });
  };
}
