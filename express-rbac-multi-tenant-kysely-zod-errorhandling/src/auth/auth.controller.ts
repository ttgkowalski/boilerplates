import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { Trace } from "../tracing";

export class AuthController {
  @Trace({ spanName: "authController.register" })
  async register(req: Request, res: Response) {
    const { user, token, roles } = await authService.registerUser(req.body);
    res.status(201).json({ user, token, roles });
  }

  @Trace({ spanName: "authController.login" })
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json(result);
  }
}

export const authController = new AuthController();
