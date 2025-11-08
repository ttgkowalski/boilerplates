import { Router, type Router as ExpressRouter } from "express";
import { userController } from "./user.controller";
import { requireRole } from "../middlewares/auth";
import { validateSchema } from "../middlewares/validate-schema";
import { createUserSchema, updateUserSchema } from "../../domain/user";
import { paramsWithIdSchema } from "../../domain/utils";

const userRoutes: ExpressRouter = Router();

userRoutes.post("/", requireRole("User"), validateSchema({ body: createUserSchema }), userController.create.bind(userController));
userRoutes.get("/", requireRole("User"), userController.list.bind(userController));
userRoutes.get("/:id", requireRole("User"), validateSchema({ params: paramsWithIdSchema }), userController.get.bind(userController));
userRoutes.patch("/:id", requireRole("User"), validateSchema({ params: paramsWithIdSchema, body: updateUserSchema }), userController.update.bind(userController));
userRoutes.delete("/:id", requireRole("User"), validateSchema({ params: paramsWithIdSchema }), userController.remove.bind(userController));

export { userRoutes }


