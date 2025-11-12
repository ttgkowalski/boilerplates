import "reflect-metadata";
import express, { Router } from "express";
import { GlobalErrorHandler } from "./middlewares/global-error-handler";
import { attachAuth } from "./middlewares/auth";
import { tracingMiddleware } from "./middlewares/tracing";
import { authRoutes } from "./auth/auth.routes";
import { userRoutes } from "./user/user.routes";
import { initializeTracing } from "./tracing";

// Inicializar tracing antes de qualquer outra coisa
initializeTracing();

const app = express();
app.use(express.json());

const router = Router(); 
router.use(attachAuth);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

app.use(tracingMiddleware);

router.get("/ping", (req, res) => {
  res.send("Pong");
});

app.use(router);

app.use(GlobalErrorHandler);
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
