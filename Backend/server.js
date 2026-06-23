const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const errorHandler = require("./Middleware/errorMiddleware");
const requestRoutes = require("./Routes/requestRoutes");

dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./Routes/userRoutes");
const productRoutes = require("./Routes/productRoutes");
const paystackRoutes = require("./Routes/paystackRoutes");
const orderRoutes = require("./Routes/orderRoutes");

const app = express();

connectDB();

// middleware first
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
    credentials: true,
  }),
);
app.use("/api/paystack", paystackRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorHandler);

// routes after middleware
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
