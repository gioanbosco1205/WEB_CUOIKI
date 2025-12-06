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

// Middleware cơ bản
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS – cho phép frontend Next.js gọi API
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Thêm middleware để xử lý preflight requests
app.options('*', cors());

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
  res.json({ 
    success: true,
    message: "🚀 API Phòng Trọ Sinh Viên đang chạy ngon lành!",
    version: "1.0.0",
    endpoints: {
      main: "/",
      chat: "/chat",
      properties: "/properties",
      tenants: "/tenants",
      managers: "/managers",
      leases: "/leases",
      applications: "/applications"
    },
    chat_ai: {
      endpoint: "/chat",
      models: "/chat/models",
      test: "/chat/test",
      health: "/chat/health",
      demo: "/chat/demo"
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Các route hiện có
app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

// THÊM DÒNG NÀY – ROUTE CHAT AI
app.use("/chat", chatRoutes); // → http://localhost:3002/chat

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

/* SERVER */
const port = Number(process.env.PORT) || 3002;

app.listen(port, "0.0.0.0", () => {
  console.log(`
  🚀 Server đang chạy tại: http://localhost:${port}
  
  📋 API Endpoints:
  🌐 Main API:      http://localhost:${port}/
  ❤️ Health:        http://localhost:${port}/health
  
  🤖 CHAT AI:
  💬 Chat API:      POST http://localhost:${port}/chat
  🧪 Test API:      GET  http://localhost:${port}/chat/test
  📊 Models:        GET  http://localhost:${port}/chat/models
  ❤️ Chat Health:   GET  http://localhost:${port}/chat/health
  🎯 Demo:          GET  http://localhost:${port}/chat/demo
  
  🏠 Phòng trọ:
  🏘️ Properties:    http://localhost:${port}/properties
  👥 Tenants:       http://localhost:${port}/tenants
  📄 Leases:        http://localhost:${port}/leases
  📝 Applications:  http://localhost:${port}/applications
  
  🔧 Environment: ${process.env.NODE_ENV || 'development'}
  ⏰ Started at: ${new Date().toISOString()}
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;