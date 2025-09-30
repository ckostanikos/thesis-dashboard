import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import crypto from "crypto";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

// routes
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/me.routes.js";
import teamRoutes from "./routes/team.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import metaRoutes from "./routes/meta.routes.js";
import courseRoutes from "./routes/course.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";

connectDB();

const app = express();

// CORS (allow credentials from your frontend)
const FRONTEND = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: FRONTEND, // you can also pass an array if you have multiple
    credentials: true,
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);

// Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Sessions (Mongo-backed)
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60, // 1 day
      touchAfter: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(morgan("dev"));

// Issues a CSRF token and store it in the session
app.get("/api/csrf", (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  req.session.csrf = token;
  res.json({ csrfToken: token });
});

// Guard: require matching X-CSRF-Token for state-changing requests
function csrfGuard(req, res, next) {
  const safe = ["GET", "HEAD", "OPTIONS"];
  if (safe.includes(req.method)) return next();
  if (req.path === "/api/csrf") return next();
  const token = req.get("X-CSRF-Token");
  if (token && token === req.session?.csrf) return next();
  return res.status(403).json({ message: "Bad CSRF token" });
}
app.use(csrfGuard);

// Health
app.get("/", (_req, res) => res.send("Server is ready"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/metrics", metricsRoutes);

// Oversized payload handler
app.use((err, _req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large (max 5 MB)" });
  }
  next(err);
});

app.use(errorHandler);
export default app;
