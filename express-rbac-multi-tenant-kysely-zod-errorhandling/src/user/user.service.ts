import { userRepo } from "./user.repo.ts";

export const create = userRepo.insertUser;
export const list = userRepo.listUsers;
export const get = userRepo.getUser;
export const update = userRepo.updateUser;
export const remove = userRepo.deleteUser;

export const userService = {
  create,
  list,
  get,
  update,
  remove,
};


