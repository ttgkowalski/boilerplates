import { db } from "../db.ts";
import type { User, NewUser, UserUpdate } from "../../domain/user/user.table";

async function insertUser(input: NewUser): Promise<User> {
  const row = await db.insertInto("users").values(input).returningAll().executeTakeFirst();
  return row!;
}

async function listUsers(): Promise<User[]> {
  return db.selectFrom("users").selectAll().execute();
}

async function getUser(id: string): Promise<User | undefined> {
  return db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
}

async function updateUser(id: string, input: UserUpdate): Promise<User | null> {
  const updated = await db.updateTable("users").set(input).where("id", "=", id).returningAll().executeTakeFirst();
  return updated ?? null;
}

async function deleteUser(id: string): Promise<void> {
  await db.deleteFrom("users").where("id", "=", id).executeTakeFirst();
}

async function getUserByEmail(email: string): Promise<User | undefined> {
  return db.selectFrom("users").selectAll().where("email", "=", email).executeTakeFirst();
}

export const userRepo = {
  insertUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserByEmail,
};

