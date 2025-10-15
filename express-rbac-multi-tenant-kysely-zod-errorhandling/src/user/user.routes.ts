import { Router } from "express";
import { userController } from "./user.controller.ts";
import { requireRole } from "../middlewares/auth.ts";
import { validateSchema } from "../middlewares/validate-schema.ts";
import { createUserSchema, updateUserSchema } from "../../domain/user";
import { paramsWithIdSchema } from "../../domain/utils";

const userRoutes = Router();

userRoutes.post("/", requireRole("User"), validateSchema({ body: createUserSchema }), userController.create);
userRoutes.get("/", requireRole("User"), userController.list);
userRoutes.get("/:id", requireRole("User"), validateSchema({ params: paramsWithIdSchema }), userController.get);
userRoutes.patch("/:id", requireRole("User"), validateSchema({ params: paramsWithIdSchema, body: updateUserSchema }), userController.update);
userRoutes.delete("/:id", requireRole("User"), validateSchema({ params: paramsWithIdSchema }), userController.remove);

export { userRoutes }


