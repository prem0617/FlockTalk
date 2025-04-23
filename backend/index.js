import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoute from "./routes/notification.route.js";
import messageRoute from "./routes/message.route.js";
import learnRoute from "./routes/learn.route.js";

import cors from "cors";
import connectMongoDB from "./db/connectMongoDB.js";

import { app, server } from "./lib/socket.io.js";

const PORT = process.env.PORT || 8000;

app.use(express.json({ limit: "10mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); //  parse incoming requests with application/x-www-form-urlencoded payloads (commonly sent by HTML forms).
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://flocktalk.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notificationRoute);
app.use("/api/message", messageRoute);
app.use("/api/learn", learnRoute);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
