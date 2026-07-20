const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const cookieParser = require("cookie-parser");
const errorHandler = require("./Middleware/errorMiddleware");
const requestRoutes = require("./Routes/requestRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const categoryRoutes = require("./Routes/categoryRoutes");

const adminRoutes = require("./Routes/adminRoutes");
const reportRoutes = require("./Routes/reportRoutes");

const connectDB = require("./config/db");
const userRoutes = require("./Routes/userRoutes");
const itemRoutes = require("./Routes/itemRoutes");
// const paystackRoutes = require("./Routes/paystackRoutes");
const orderRoutes = require("./Routes/requestRoutes");

const app = express();

connectDB();

const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "");
const allowedOrigins = new Set([
  "http://localhost:5173",
  ...String(process.env.FRONTEND_URL || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean),
]);

// middleware first
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header include server-to-server and health checks.
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
// app.use("/api/paystack", paystackRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes after middleware
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/requests", requestRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(errorHandler);
