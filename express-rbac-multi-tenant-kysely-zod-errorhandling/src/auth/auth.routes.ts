import { Router, type Router as ExpressRouter } from "express";
import { authController } from "./auth.controller";
import { validateSchema } from "../middlewares/validate-schema";
import { loginSchema, registerSchema } from "../../domain/authentication/";

const authRoutes: ExpressRouter = Router();

authRoutes.post("/register", validateSchema({ body: registerSchema }), authController.register.bind(authController));
authRoutes.post("/login", validateSchema({ body: loginSchema }), authController.login.bind(authController));

export { authRoutes };
