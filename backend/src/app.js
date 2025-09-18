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
import sysadminRoutes from "./routes/sysadmin.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/sysadmin", sysadminRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use(errorHandler);
export default app;
