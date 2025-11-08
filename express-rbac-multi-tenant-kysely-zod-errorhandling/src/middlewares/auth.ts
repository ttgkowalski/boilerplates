import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        roles: string[];
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
    const payload = verify(token, secret) as { sub: string; roles: string[] };
    req.auth = { userId: payload.sub, roles: payload.roles || [] };
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    // invalid token: continue without auth; downstream middlewares may require role
  }
  next();
}

export function requireRole(requiredRoles: string | string[]) {
  const rolesList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !req.auth.roles || req.auth.roles.length === 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verificar se o usuário tem pelo menos uma das roles necessárias
    const userRoles = req.auth.roles;
    const hasRequiredRole = rolesList.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
