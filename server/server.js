import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// =====================
// 🔧 MIDDLEWARE
// =====================
app.use(express.json({ limit: "4mb" }));
app.use(cors({
  origin: "*",
  credentials: true
}));

// =====================
// ✅ BASIC TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("🚀 QuickChat backend is running");
});

app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "Server is live" });
});

// =====================
// 🔐 API ROUTES
// =====================
app.use("/api/auth", userRouter);     // 👈 SIGNUP / LOGIN
app.use("/api/messages", messageRouter);

// =====================
// 🔌 SOCKET.IO SETUP
// =====================
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track online users
export const userSocketMap = {}; // { userId: socketId }

// 🔐 Socket authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;

    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

// Socket connection
io.on("connection", (socket) => {
  const userId = socket.userId;

  console.log("✅ Socket connected:", socket.id, "User:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("sendMessage", (data) => {
    socket.broadcast.emit("receiveMessage", {
      ...data,
      senderId: userId,
      createdAt: new Date()
    });
  });

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

// =====================
// 🚀 START SERVER
// =====================
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log("✅ MongoDB connected");
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();
