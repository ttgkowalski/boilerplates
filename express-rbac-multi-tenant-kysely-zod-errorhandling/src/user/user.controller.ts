import type { Request, Response } from "express";
import { userService } from "./user.service";
import { Trace } from "../tracing";

export class UserController {
  @Trace({ spanName: "userController.create" })
  async create(req: Request, res: Response) {
    const created = await userService.create(req.body);
    res.status(201).json(created);
  }

  @Trace({ spanName: "userController.list" })
  async list(_req: Request, res: Response) {
    res.json(await userService.list());
  }

  @Trace({ spanName: "userController.get" })
  async get(req: Request<{ id: string }>, res: Response) {
    const item = await userService.get(req.params.id);
    res.json(item);
  }

  @Trace({ spanName: "userController.update" })
  async update(req: Request<{ id: string }>, res: Response) {
    const updated = await userService.update(req.params.id, req.body);
    res.json(updated);
  }

  @Trace({ spanName: "userController.remove" })
  async remove(req: Request<{ id: string }>, res: Response) {
    await userService.remove(req.params.id);
    res.status(204).end();
  }
}

export const userController = new UserController();
