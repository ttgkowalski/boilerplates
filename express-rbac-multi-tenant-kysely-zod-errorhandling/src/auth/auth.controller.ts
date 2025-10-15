import type { Request, Response } from "express";
import { authService } from "./auth.service.ts";

async function register(req: Request, res: Response) {
  const { user, token } = await authService.registerUser(req.body);
  res.status(201).json({ user, token });
}

async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  if (!result) return res.status(401).json({ error: "Invalid credentials" });
  res.json(result);
}

export const authController = {
  register,
  login,
};
