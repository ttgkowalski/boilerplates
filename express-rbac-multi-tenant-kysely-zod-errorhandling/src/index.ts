import express, { Router } from "express";
import { GlobalErrorHandler } from "./middlewares/global-error-handler";
import { BadRequestError, NotFoundError } from "./errors/api-errors";
import { authRoutes } from "./auth/auth.routes.ts";
import { userRoutes } from "./user/user.routes.ts";

const app = express();
app.use(express.json());

const router = Router(); 

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.get("/:id", (req, res) => {
  const { id } = req.params;
  
  if (id === "0") {
    throw new BadRequestError("ID inválido");
  }
  
  if (id === "999") {
    throw new NotFoundError("User");
  }
  
  res.json({ id, name: "Alice" });
});

router.get("/ping", (req, res) => {
  res.send("Pong");
});

app.use(router);

app.use(GlobalErrorHandler);
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
