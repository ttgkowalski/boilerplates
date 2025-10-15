import type { Request, Response } from "express";
import { userService } from "./user.service.ts";

async function create(req: Request, res: Response) {
  const created = await userService.create(req.body);
  res.status(201).json(created);
}

async function list(_req: Request, res: Response) {
  res.json(await userService.list());
}

async function get(req: Request<{ id: string }>, res: Response) {
  const item = await userService.get(req.params.id);
  if (!item) return res.status(404).end();
  res.json(item);
}

async function update(req: Request<{ id: string }>, res: Response) {
  const updated = await userService.update(req.params.id, req.body);
  if (!updated) return res.status(404).end();
  res.json(updated);
}

async function remove(req: Request<{ id: string }>, res: Response) {
  await userService.remove(req.params.id);
  res.status(204).end();
}

export const userController = {
  create,
  list,
  get,
  update,
  remove,
};


