import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware";
/* ROUTE IMPORT */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";

import path from "path";


/* CONFIGURATIONS */
dotenv.config();//được gọi đầu tiên để đảm bảo các biến môi trường có sẵn.
const app = express();//Khởi tạo ứng dụng server.
app.use(express.json());//dùng để phân tích các request có body là JSON.
app.use(helmet());//Kích hoạt bảo mật helmet.
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));//Kích hoạt morgan để ghi log theo định dạng "common".
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());//Cho phép tất cả các yêu cầu từ origin khác (ví dụ: client Next.js).

// Configure static file serving
app.use('/Images', express.static('public/Images', {
  maxAge: '1d',
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }
}));
/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
//app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/tenants", tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3002;
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
// Cho phép truy cập thư mục uploads (dùng để xem ảnh local)

