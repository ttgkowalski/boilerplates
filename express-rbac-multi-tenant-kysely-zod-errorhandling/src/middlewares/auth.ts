import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../errors";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user_id: string;
        roles: string[];
        tenant_id: string | null;
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
    const secret = "i-am-an-idiot";
    const payload = verify(token, secret) as { sub: string; roles: string[]; tenant_id?: string | null };
    req.auth = { 
      user_id: payload.sub, 
      roles: payload.roles || [],
      tenant_id: payload.tenant_id ?? null
    };
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
      throw new UnauthorizedError("Unauthorized");
    }

    // Verificar se o usuário tem pelo menos uma das roles necessárias
    const userRoles = req.auth.roles;
    const hasRequiredRole = rolesList.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenError("Forbidden");
    }

    next();
  };
}
