// src/index.ts (hoặc server.ts)
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { authMiddleware } from "./middleware/authMiddleware";

/* ROUTE IMPORTS */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";

// THÊM DÒNG NÀY – IMPORT CHAT ROUTE
import chatRoutes from "./routes/chatRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));//Kích hoạt morgan để ghi log theo định dạng "common".
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS – cho phép frontend Next.js gọi API
app.use(cors({
  origin: ["http://localhost:3000", "https://yourdomain.com"], // thêm domain khi deploy
  credentials: true,
}));

// Static files
app.use('/Images', express.static('public/Images', {
  maxAge: '1d',
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ROUTES */
app.get("/", (req, res) => {
  res.json({ message: "API Phòng Trọ Sinh Viên đang chạy ngon lành!" });
});

// Các route hiện có
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

// THÊM DÒNG NÀY – ROUTE CHAT AI
app.use("/chat", chatRoutes); // → http://localhost:3002/chat

/* SERVER */
const port = Number(process.env.PORT) || 3002;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`);
  console.log(`Chat AI endpoint: http://localhost:${port}/chat`);
});