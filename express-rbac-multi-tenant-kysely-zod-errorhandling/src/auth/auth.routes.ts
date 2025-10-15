import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { validateSchema } from "../middlewares/validate-schema.ts";
import { loginSchema, registerSchema } from "../../domain/authentication/";

const authRoutes = Router();

authRoutes.post("/register", validateSchema({ body: registerSchema }), authController.register);
authRoutes.post("/login", validateSchema({ body: loginSchema }), authController.login);

export { authRoutes };
