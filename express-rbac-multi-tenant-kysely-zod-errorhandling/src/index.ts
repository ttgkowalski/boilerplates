import express, { Router } from "express";
import { GlobalErrorHandler } from "./middlewares/global-error-handler";
import { attachAuth } from "./middlewares/auth";
import { authRoutes } from "./auth/auth.routes";
import { userRoutes } from "./user/user.routes";

const app = express();
app.use(express.json());

const router = Router(); 
router.use(attachAuth);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.get("/ping", (req, res) => {
  res.send("Pong");
});

app.use(router);

app.use(GlobalErrorHandler);
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
