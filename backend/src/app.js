import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

//routes
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/me.routes.js";
import kpiRoutes from "./routes/kpi.routes.js";
import teamRoutes from "./routes/team.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// Custom handler for oversized JSON/form bodies
app.use((err, _req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large (max 5 MB)" });
  }
  next(err);
});

app.use(errorHandler);
export default app;
