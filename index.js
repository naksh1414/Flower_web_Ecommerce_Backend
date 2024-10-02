import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV,
    },
  })
);

// MongoDB Connection
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB: ", err));

// Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
